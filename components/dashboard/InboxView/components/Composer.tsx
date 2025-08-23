import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Smile, Send, Bot, MessageSquare, Zap, Sticker } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Picker } from "emoji-mart"
import "emoji-mart/css/emoji-mart.css"
import Lottie from "lottie-react"

interface ComposerProps {
  message: string
  setMessage: (v: string) => void
  onSend: () => void
  onFilePick: (e: React.ChangeEvent<HTMLInputElement>) => void
  onImagePick: (e: React.ChangeEvent<HTMLInputElement>) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  imageInputRef: React.RefObject<HTMLInputElement | null>
  disabled?: boolean
  onQuickReply?: () => void
  onTriggerChatbot?: () => void
  onRefresh?: () => void
  onPasteFiles?: (files: FileList | File[]) => void
}

export function Composer({
  message,
  setMessage,
  onSend,
  onFilePick,
  onImagePick,
  fileInputRef,
  imageInputRef,
  disabled,
  onQuickReply,
  onTriggerChatbot,
  onRefresh,
  onPasteFiles
}: ComposerProps) {
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false)
  const [showUploadModal, setShowUploadModal] = React.useState(false)
  const [showStickerPicker, setShowStickerPicker] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<'images' | 'videos' | 'documents' | 'audios' | 'stickers'>('images')

  // Paste handler for images/files
  const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!onPasteFiles) return
    const files = e.clipboardData.files
    if (files && files.length > 0) {
      e.preventDefault()
      onPasteFiles(files)
    }
  }, [onPasteFiles])

  return (
    <div className="border-t p-4 bg-gray-50 rounded-t-lg h-20 flex items-center">
      {/* Left icons fixed width */}
      <div className="flex items-center gap-0.5 shrink-0">
        {/* Keep just one hidden input per type */}
        <input type="file" ref={fileInputRef} onChange={onFilePick} className="hidden" accept=".pdf,.doc,.docx,.txt,.xlsx,.csv,.zip,.rar" />
        <input type="file" ref={imageInputRef} onChange={onImagePick} className="hidden" accept="image/*,video/*,audio/*" />

        <Button variant="ghost" size="icon" onClick={() => {
          setShowUploadModal(true);
          setSelectedCategory('images');
        }} className="text-gray-700 hover:bg-gray-100 h-10 w-10" title="Upload">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onQuickReply} title="Quick reply" className="text-gray-700 hover:bg-gray-100 h-10 w-10">
          <Zap className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onTriggerChatbot} title="Trigger chatbot" className="text-gray-700 hover:bg-gray-100 h-10 w-10">
          <Bot className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onRefresh} title="Refresh messages" className="text-gray-700 hover:bg-gray-100 h-10 w-10">
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShowStickerPicker(true)} title="Stickers" className="text-gray-700 hover:bg-gray-100 h-10 w-10">
          <Sticker className="h-4 w-4" />
        </Button>
      </div>

      {/* Input expands full remaining width */}
      <div className="flex-1 relative ml-2">
        <Input
          placeholder="Type message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          className="w-full pr-20 rounded-full border-green-300 focus:border-green-500 focus:ring-green-500 bg-gray-50 focus:bg-white h-12 text-sm"
          onKeyDown={(e) => {
            if (!disabled && e.key === "Enter") onSend()
          }}
          onPaste={handlePaste}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-500 hover:text-gray-700">
                <Smile className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0">
              <div style={{ width: 320 }}>
                <Picker onSelect={(e: any) => { setMessage(message + (e.native || "")); setShowEmojiPicker(false) }} />
              </div>
            </PopoverContent>
          </Popover>
          <Button size="icon" className="h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full" onClick={() => {
            if (!disabled) onSend()
          }} disabled={disabled || !message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Sticker Picker Modal */}
      {showStickerPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Sticker Picker</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowStickerPicker(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <span className="text-gray-500 text-lg">×</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-6 gap-3 max-h-[400px] overflow-y-auto p-4">
              {/* Actual sticker library with emojis and symbols */}
              {[
                '😀', '😍', '😂', '🥰', '😎', '🤔',
                '👍', '👎', '👏', '🙌', '🤝', '💪',
                '❤️', '💔', '💖', '💕', '💗', '💓',
                '🎉', '🎊', '🎈', '🎁', '🎂', '🎵',
                '🔥', '💯', '⭐', '🌟', '✨', '💫',
                '🌈', '☀️', '🌙', '🌺', '🌸', '🌼'
              ].map((sticker, i) => (
                <div
                  key={i}
                  className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-100 border-2 border-transparent hover:border-green-300 transition-all hover:scale-110"
                  onClick={() => {
                    setMessage(message + sticker)
                    setShowStickerPicker(false)
                  }}
                  title={`Add ${sticker} to message`}
                >
                  <span className="text-2xl">{sticker}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Click on any sticker to add it to your message
            </div>
          </div>
        </div>
      )}

      {/* Upload modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[90vw] p-6">
            {/* Header with close button */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Upload Files</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowUploadModal(false)}
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <span className="text-gray-500 text-lg">×</span>
              </Button>
            </div>
            
            <div className="flex gap-6">
              {/* Left sidebar with categories */}
              <div className="w-40 border-r pr-4 space-y-3">
                <button onClick={() => setSelectedCategory('images')} className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'images' ? 'bg-green-50 text-green-700 font-medium border-r-2 border-green-500' : 'hover:bg-gray-50 text-gray-600'}`}>Images</button>
                <button onClick={() => setSelectedCategory('videos')} className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'videos' ? 'bg-green-50 text-green-700 font-medium border-r-2 border-green-500' : 'hover:bg-gray-50 text-gray-600'}`}>Videos</button>
                <button onClick={() => setSelectedCategory('documents')} className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'documents' ? 'bg-green-50 text-green-700 font-medium border-r-2 border-green-500' : 'hover:bg-gray-50 text-gray-600'}`}>Documents</button>
                <button onClick={() => setSelectedCategory('audios')} className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'audios' ? 'bg-green-50 text-green-700 font-medium border-r-2 border-green-500' : 'hover:bg-gray-50 text-gray-600'}`}>Audios</button>
                <button onClick={() => setSelectedCategory('stickers')} className={`w-full text-left py-2 px-3 rounded-lg transition-colors ${selectedCategory === 'stickers' ? 'bg-green-50 text-green-700 font-medium border-r-2 border-green-500' : 'hover:bg-gray-50 text-gray-600'}`}>Stickers</button>
              </div>
              
              {/* Main upload area */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                {/* Cloud upload icon */}
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                </div>
                
                <div className="text-xl font-semibold text-gray-800 mb-2">Drag & Drop Files Here</div>
                <div className="text-sm text-gray-500 mb-2">
                  {selectedCategory === 'images' && '(Supported file types: jpeg, png, gif, webp)'}
                  {selectedCategory === 'videos' && '(Supported file types: mp4, avi, mov, webm)'}
                  {selectedCategory === 'documents' && '(Supported file types: pdf, doc, docx, txt, xlsx, csv, zip, rar)'}
                  {selectedCategory === 'audios' && '(Supported file types: mp3, wav, aac, ogg)'}
                  {selectedCategory === 'stickers' && '(Supported file types: png, gif, webp)'}
                </div>
                <div className="text-sm text-gray-500 mb-6">
                  Learn more about supported file formats{" "}
                  <span className="text-green-600 cursor-pointer hover:underline">here</span>
                </div>
                
                <div className="text-gray-400 mb-4">-Or-</div>
                
                <Button 
                  onClick={() => {
                    if (selectedCategory === 'documents') fileInputRef.current?.click();
                    else imageInputRef.current?.click();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
                >
                  Browse Files
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
