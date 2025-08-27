"use client"

import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-4 group-[.toaster]:border-black group-[.toaster]:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-[.toaster]:rounded-lg group-[.toaster]:font-bold',
          description: 'group-[.toast]:text-gray-700 group-[.toast]:font-medium',
          actionButton: 'group-[.toast]:bg-gradient-to-r group-[.toast]:from-purple-600 group-[.toast]:to-blue-600 group-[.toast]:text-white group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-[.toast]:font-bold group-[.toast]:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
          cancelButton: 'group-[.toast]:bg-white group-[.toast]:text-black group-[.toast]:border-2 group-[.toast]:border-black group-[.toast]:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-[.toast]:font-bold group-[.toast]:hover:bg-gray-100 group-[.toast]:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
          success: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-green-50 group-[.toaster]:to-emerald-50 group-[.toaster]:border-green-600',
          error: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-red-50 group-[.toaster]:to-pink-50 group-[.toaster]:border-red-600',
          warning: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-yellow-50 group-[.toaster]:to-amber-50 group-[.toaster]:border-yellow-600',
          info: 'group-[.toaster]:bg-gradient-to-r group-[.toaster]:from-blue-50 group-[.toaster]:to-cyan-50 group-[.toaster]:border-blue-600',
        },
      }}
      position="bottom-right"
      expand={false}
      richColors
      {...props}
    />
  )
}

export { Toaster }
