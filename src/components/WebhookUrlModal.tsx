"use client";

import { useState, useEffect } from "react";
import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalTitle, 
  ModalDescription, 
  ModalFooter 
} from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WebhookUrlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  title: string;
  description?: string;
  defaultUrl?: string;
}

export function WebhookUrlModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description = "Enter the webhook URL to use for this operation.",
  defaultUrl = "http://127.0.0.1:5678/webhook"
}: WebhookUrlModalProps) {
  const [url, setUrl] = useState(defaultUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset URL when modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl(defaultUrl);
      setIsSubmitting(false);
    }
  }, [isOpen, defaultUrl]);

  const handleSubmit = () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Validate URL format
      new URL(url);
      
      onSubmit(url);
      onClose();
    } catch (error) {
      toast.error("Please enter a valid URL");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        <div className="py-4">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter webhook URL"
            className="w-full"
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            className="bg-[#97D700] text-[#121212] hover:bg-[#85bd00]"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 