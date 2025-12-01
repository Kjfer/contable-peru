import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Invoices from "./pages/Invoices";
import AccountingEntries from "./pages/AccountingEntries";
import GeneralLedger from "./pages/GeneralLedger";
import Reports from "./pages/Reports";
import Import from "./pages/Import";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/accounting-entries" element={<AccountingEntries />} />
            <Route path="/general-ledger" element={<GeneralLedger />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/import" element={<Import />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
