"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query';
import serverHandler from '@/utils/api/enpointsUtils/serverHandler';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: number;
  name: string;
  email: string;
  mobile: string;
  message: string;
  date: string;
}

interface LeadsResponse {
  data: Lead[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

const fetchLeads = async (page: number, limit: number, search: string): Promise<LeadsResponse> => {
  const res = await serverHandler.get(`/api/admin/get_contact_leads?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
  return res.data as LeadsResponse;
};

export default function LeadsManage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { toast } = useToast ? useToast() : { toast: () => {} };

  const { data, isLoading, isError } = useQuery<LeadsResponse>({
    queryKey: ['get-contact-leads', page, limit, searchTerm],
    queryFn: () => fetchLeads(page, limit, searchTerm),
    keepPreviousData: true,
  });

  const leads = data?.data || [];
  const pagination = data?.pagination || { totalItems: 0, totalPages: 1, currentPage: 1, pageSize: limit };

  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Leads Management
            </CardTitle>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
              <Input
                placeholder="Search leads..."
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
                  <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Email</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Mobile</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Message</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
                ) : isError ? (
                  <tr><td colSpan={5} className="text-center py-4 text-red-500">Failed to load leads</td></tr>
                ) : leads.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4">No leads found</td></tr>
                ) : (
                  leads.map((lead) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="border border-gray-200 px-4 py-2">{lead.name}</td>
                      <td className="border border-gray-200 px-4 py-2">{lead.email}</td>
                      <td className="border border-gray-200 px-4 py-2">{lead.mobile}</td>
                      <td className="border border-gray-200 px-4 py-2 max-w-xs truncate">{lead.message}</td>
                      <td className="border border-gray-200 px-4 py-2">{lead.date}</td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-600">
              {pagination.totalItems > 0
                ? `Showing ${(pagination.currentPage - 1) * pagination.pageSize + 1} to ${Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)} of ${pagination.totalItems} entries`
                : 'No entries'}
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => setPage(page - 1)}
              >
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
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
