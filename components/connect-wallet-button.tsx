"use client";

import { useLoginWithAbstract } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Wallet } from "lucide-react";

interface ConnectWalletButtonProps {
  customDropdownItems?: React.ReactNode[];
  className?: string;
}

export function ConnectWalletButton({
  customDropdownItems,
  className,
}: ConnectWalletButtonProps) {
  const { login, logout } = useLoginWithAbstract();
  const { address, status, isConnecting, isReconnecting } = useAccount();

  const isLoading = status === "connecting" || status === "reconnecting" || isConnecting || isReconnecting;

  if (status === "connected" && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={className}>
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage src={`https://avatar.vercel.sh/${address}`} />
              <AvatarFallback>
                {address.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline">
              {address.slice(0, 6)}...{address.slice(-4)}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem disabled className="opacity-100 font-semibold">
            {address.slice(0, 6)}...{address.slice(-4)}
          </DropdownMenuItem>
          
          {customDropdownItems}
          
          <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={login} 
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}

