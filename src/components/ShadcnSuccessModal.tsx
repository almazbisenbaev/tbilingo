"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

interface SuccessModalProps {
  isOpen: boolean
  title: string
  message: string
  onClose: () => void
}

export function SuccessModal({
  isOpen,
  title,
  message,
  onClose,
}: SuccessModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <DialogTitle className="text-xl font-semibold text-green-700">
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 text-base">
            {message}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mt-6">
          <Button 
            onClick={onClose}
            className="px-8 bg-green-600 hover:bg-green-700"
          >
            Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default SuccessModal