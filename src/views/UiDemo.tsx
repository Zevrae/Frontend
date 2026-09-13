import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ShoppingBag, Eye, SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../components/ui/dialog";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "../components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../components/ui/table";

const SAMPLE_ORDERS = [
  { id: "ZV-94021", item: "Shadow Ronin Graphic Tee", date: "Sep 11, 2026", status: "Delivered", amount: "₹3,499" },
  { id: "ZV-94022", item: "Golden Rose Pendant", date: "Sep 10, 2026", status: "Processing", amount: "₹14,999" },
  { id: "ZV-94023", item: "Ellie Puff Keychain", date: "Sep 08, 2026", status: "Shipped", amount: "₹449" },
  { id: "ZV-94024", item: "Nextmove Tailored Lower", date: "Sep 05, 2026", status: "Delivered", amount: "₹4,299" },
];

export default function UiDemo() {
  const [selectedItem, setSelectedItem] = useState("All Collections");

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] pt-32 pb-24 px-6 md:px-12 font-sans">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-plex-mono text-[var(--theme-accent)] hover:brightness-125 mb-6 uppercase tracking-[0.2em] transition-all"
          >
            <ArrowLeft size={14} /> Back to Storefront
          </Link>
          <p className="text-xs font-plex-mono text-[var(--theme-accent)] tracking-[0.3em] uppercase mb-2">
            ZEVRAE Luxury Design System
          </p>
          <h1 className="text-3xl md:text-5xl font-archivo font-bold uppercase tracking-[0.1em] text-[var(--theme-text)]">
            shadcn/ui Component Suite
          </h1>
          <p className="text-sm font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] mt-3 max-w-2xl leading-relaxed">
            Production-ready luxury primitives customized to seamlessly map into ZEVRAE's dynamic theme tokens with zero disruption to existing UI, routes, or animations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 1. Modal / Dialog */}
          <div className="p-8 border border-[rgba(var(--theme-accent-rgb),0.2)] bg-[rgba(var(--theme-surface-rgb),0.5)] backdrop-blur-md rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="text-[var(--theme-accent)] w-4 h-4" />
              <h2 className="text-sm font-plex-mono uppercase tracking-[0.2em] text-[var(--theme-accent)]">
                1. Luxury Dialog (Modal)
              </h2>
            </div>
            <p className="text-xs font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] mb-6">
              Dark glassmorphic backdrop with gold border accents and Archivo typography.
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Eye className="w-3.5 h-3.5 mr-1" /> Open Quick View
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <p className="text-[10px] font-plex-mono uppercase tracking-[0.3em] text-[var(--theme-accent)] mb-1">
                    Fine Jewellery Preview
                  </p>
                  <DialogTitle>The Golden Rose Pendant</DialogTitle>
                  <DialogDescription>
                    Handcrafted in 18k solid gold vermeil. A centerpiece designed for modern luxury, featuring signature artisanal engravings.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 border-y border-[rgba(var(--theme-accent-rgb),0.15)] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] block">Price</span>
                    <span className="text-lg font-archivo font-bold text-[var(--theme-accent)]">₹14,999</span>
                  </div>
                  <span className="text-[11px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[var(--theme-accent)]" /> In Stock (Limited Run)
                  </span>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Dismiss</Button>
                  </DialogClose>
                  <Button variant="default">Add to Bag</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 2. Sheet / Side Drawer */}
          <div className="p-8 border border-[rgba(var(--theme-accent-rgb),0.2)] bg-[rgba(var(--theme-surface-rgb),0.5)] backdrop-blur-md rounded-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="text-[var(--theme-accent)] w-4 h-4" />
              <h2 className="text-sm font-plex-mono uppercase tracking-[0.2em] text-[var(--theme-accent)]">
                2. Sliding Sheet (Drawer)
              </h2>
            </div>
            <p className="text-xs font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] mb-6">
              Smooth slide-in panel from any side, ideal for luxury cart preview or filters.
            </p>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Open Bag Drawer
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <p className="text-[10px] font-plex-mono uppercase tracking-[0.3em] text-[var(--theme-accent)]">
                    Your Selection
                  </p>
                  <SheetTitle>Shopping Bag</SheetTitle>
                  <SheetDescription>
                    Review your items before proceeding to secure luxury checkout.
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6 flex-1 flex flex-col justify-center items-center text-center">
                  <div className="w-12 h-12 rounded-full border border-[rgba(var(--theme-accent-rgb),0.3)] flex items-center justify-center mb-3">
                    <ShoppingBag className="w-6 h-6 text-[var(--theme-accent)]" />
                  </div>
                  <p className="text-xs font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] uppercase tracking-wider">
                    2 Items Selected
                  </p>
                  <p className="text-[11px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] mt-1">
                    Complimentary insured express delivery included.
                  </p>
                </div>
                <SheetFooter className="mt-auto">
                  <SheetClose asChild>
                    <Button variant="default" className="w-full">
                      Proceed to Checkout
                    </Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* 3. Dropdown Menu & Buttons */}
        <div className="p-8 border border-[rgba(var(--theme-accent-rgb),0.2)] bg-[rgba(var(--theme-surface-rgb),0.5)] backdrop-blur-md rounded-sm mb-12">
          <div className="flex items-center gap-2 mb-3">
            <SlidersHorizontal className="text-[var(--theme-accent)] w-4 h-4" />
            <h2 className="text-sm font-plex-mono uppercase tracking-[0.2em] text-[var(--theme-accent)]">
              3. Dropdown Menu & Button Variants
            </h2>
          </div>
          <p className="text-xs font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] mb-6">
            Accessible, keyboard-navigable dropdowns with subtle gold highlights.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Filter: {selectedItem}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Collections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedItem("Clothing")}>
                  Clothing (Men & Women)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedItem("Jewellery")}>
                  Fine Jewellery
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedItem("Accessories")}>
                  Accessories & Toys
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSelectedItem("All Collections")}>
                  Reset Filter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="default">Primary Gold</Button>
            <Button variant="outline">Luxury Outline</Button>
            <Button variant="ghost">Ghost Accent</Button>
            <Button variant="link">Underline Link</Button>
          </div>
        </div>

        {/* 4. Data Table */}
        <div className="p-8 border border-[rgba(var(--theme-accent-rgb),0.2)] bg-[rgba(var(--theme-surface-rgb),0.5)] backdrop-blur-md rounded-sm">
          <h2 className="text-sm font-plex-mono uppercase tracking-[0.2em] text-[var(--theme-accent)] mb-2">
            4. Luxury Data Table
          </h2>
          <p className="text-xs font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] mb-6">
            Designed for order tracking, account dashboards, and inventory management.
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SAMPLE_ORDERS.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-bold text-[var(--theme-accent)]">{order.id}</TableCell>
                  <TableCell>{order.item}</TableCell>
                  <TableCell className="text-[rgba(var(--theme-text-rgb),0.6)]">{order.date}</TableCell>
                  <TableCell>
                    <span className="inline-block px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-xs bg-[rgba(var(--theme-accent-rgb),0.1)] text-[var(--theme-accent)] border border-[rgba(var(--theme-accent-rgb),0.3)]">
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-bold text-[var(--theme-text)]">{order.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
