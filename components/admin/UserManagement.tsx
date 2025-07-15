"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import serverHandler from '@/utils/serverHandler';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { login as loginAction } from '@/store/slices/authSlice';

interface User {
  id: string;
  uid?: string;
  name: string;
  email: string;
  mobile_with_country_code?: string;
  timezone?: string;
  plan?: string | { title?: string; name?: string };
  plan_expire?: string;
}

interface UsersResponse {
  data: User[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const fetchUsers = async (page: number, limit: number, search: string): Promise<UsersResponse> => {
  const searchFields = 'name,email';
  const res = await serverHandler.get(`/api/admin/get_users?page=${page}&limit=${limit}&search=${search}&searchFields=${searchFields}`);
  return res.data as UsersResponse;
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const { data, isLoading } = useQuery<UsersResponse>({
    queryKey: ['get-users', page, limit, searchTerm],
    queryFn: async () => await fetchUsers(page, limit, searchTerm),
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutations for update and delete (stubs)
  const updateUserMutation = useMutation({
    mutationFn: async (payload: any) => {
      // POST /api/admin/update_user with all required fields
      const response = await serverHandler.post('/api/admin/update_user', payload);
      return response.data;
    },
    onSuccess: (data) => {
      if ((data as any).success) {
        toast({ 
          title: 'Success', 
          description: (data as any).data?.msg || 'User updated successfully', 
          variant: 'default' 
        });
        queryClient.invalidateQueries({ queryKey: ['get-users'] });
        setEditUser(null);
      } else {
        toast({ 
          title: 'Error', 
          description: (data as any).data?.msg || 'Update failed', 
          variant: 'destructive' 
        });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: error?.response?.data?.msg || 'Update failed', 
        variant: 'destructive' 
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (user: User) => await serverHandler.post('/api/admin/del_user', { id: user.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-users'] });
      setDeleteUser(null);
    },
  });

  const users: User[] = data?.data || [];
  const pagination = data?.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: limit };

  const handleAutoLogin = async (user: User) => {
    if (user.uid) {
      try {
        // Save admin token if present and role is admin
        const currentToken = localStorage.getItem('serviceToken');
        const currentRole = localStorage.getItem('role');
        if (currentToken && currentRole === 'admin') {
          localStorage.setItem('adminToken', currentToken);
        }
        const response = await serverHandler.post('/api/admin/auto_login', { uid: user.uid });
        const data: any = response.data;
        if (data.success && data.token) {
          localStorage.setItem('serviceToken', data.token);
          localStorage.setItem('role', 'user');
          if (data.user) {
            dispatch(loginAction({
              id: data.user.id,
              username: data.user.name || data.user.username || '',
              email: data.user.email || '',
            }));
            localStorage.setItem('user', JSON.stringify({
              id: data.user.id,
              username: data.user.name || data.user.username || '',
              email: data.user.email || '',
            }));
          }
          window.location.href = '/dashboard';
        } else {
          toast({ title: 'Error', description: data?.msg || 'Auto-login failed', variant: 'destructive' });
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error?.response?.data?.msg || 'Auto-login failed', variant: 'destructive' });
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">👥</span>
              User Management
            </CardTitle>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Auto Login</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Mobile</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Timezone</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Plan</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Plan Expiry</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} className="text-center py-8">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8">No users found.</td></tr>
                ) : users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="border border-gray-200 px-4 py-2">
                      <Button
                        size="sm"
                        onClick={() => handleAutoLogin(user)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <i className="fas fa-sign-in-alt mr-1"></i>
                        Login
                      </Button>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{user.name}</td>
                    <td className="border border-gray-200 px-4 py-2">{user.email}</td>
                    <td className="border border-gray-200 px-4 py-2">{user.mobile_with_country_code || '-'}</td>
                    <td className="border border-gray-200 px-4 py-2">{user.timezone || '-'}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      {typeof user.plan === 'string' 
                        ? user.plan 
                        : user.plan?.title || user.plan?.name || '-'
                      }
                    </td>
                    <td className="border border-gray-200 px-4 py-2">{user.plan_expire || '-'}</td>
                    <td className="border border-gray-200 px-4 py-2">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditUser(user)}
                          className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteUser(user)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of {pagination.totalItems} entries
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled={pagination.currentPage === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  variant="outline"
                  size="sm"
                  className={pagination.currentPage === i + 1 ? "bg-blue-600 text-white" : ""}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Modal (stub) */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <Formik
              initialValues={{
                name: editUser.name,
                email: editUser.email,
                mobile_with_country_code: editUser.mobile_with_country_code || '',
                timezone: editUser.timezone || '',
                newPassword: '',
                uid: editUser.uid || '',
              }}
              validationSchema={Yup.object({
                name: Yup.string().required('Name is required'),
                email: Yup.string().email('Invalid email').required('Email is required'),
                mobile_with_country_code: Yup.string(),
                timezone: Yup.string(),
                newPassword: Yup.string(),
                uid: Yup.string().required('UID is required'),
              })}
              onSubmit={async (values, { resetForm }) => {
                await updateUserMutation.mutateAsync(values);
                resetForm();
              }}
            >
              {({ handleSubmit, isSubmitting, errors, touched }) => (
                <Form onSubmit={handleSubmit}>
                  <div className="mb-2">
                    <label className="block mb-1">Name</label>
                    <Field name="name" className="w-full border px-2 py-1" />
                    {touched.name && errors.name && <div className="text-red-500 text-xs">{errors.name}</div>}
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1">Email</label>
                    <Field name="email" className="w-full border px-2 py-1" />
                    {touched.email && errors.email && <div className="text-red-500 text-xs">{errors.email}</div>}
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1">Mobile</label>
                    <Field name="mobile_with_country_code" className="w-full border px-2 py-1" />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1">Timezone</label>
                    <Field name="timezone" className="w-full border px-2 py-1" />
                  </div>
                  <div className="mb-2">
                    <label className="block mb-1">New Password</label>
                    <Field name="newPassword" type="password" className="w-full border px-2 py-1" />
                    <div className="text-xs text-gray-500">Leave blank to keep current password</div>
                  </div>
                  <Field name="uid" type="hidden" />
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button type="submit" disabled={isSubmitting}>Save</Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Delete User Dialog (stub) */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p>Are you sure you want to delete <b>{deleteUser.name}</b>?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setDeleteUser(null)}>Cancel</Button>
              <Button type="button" variant="destructive" onClick={() => deleteUserMutation.mutate(deleteUser)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
