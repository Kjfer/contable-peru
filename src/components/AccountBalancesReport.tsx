import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccountBalances, AccountBalance } from "@/hooks/useAccountBalances";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Wallet, Banknote, TrendingUp, TrendingDown, ArrowRightLeft, FileDown } from "lucide-react";
import { exportAccountBalancesReportToPDF } from "@/lib/pdfExport";
import { useBusinesses } from "@/hooks/useBusinesses";
import { getPeriodLabel } from "@/lib/periodUtils";

interface AccountBalancesReportProps {
  businessId: string;
  period: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getAccountIcon = (type: string) => {
  switch (type) {
    case "bank":
      return <Building2 className="h-4 w-4" />;
    case "wallet":
      return <Wallet className="h-4 w-4" />;
    case "cash":
      return <Banknote className="h-4 w-4" />;
    default:
      return <Wallet className="h-4 w-4" />;
  }
};

const getAccountTypeLabel = (type: string) => {
  switch (type) {
    case "bank":
      return "Banco";
    case "wallet":
      return "Billetera Digital";
    case "cash":
      return "Efectivo";
    default:
      return type;
  }
};

const getMovementIcon = (type: string) => {
  switch (type) {
    case "income":
      return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    case "expense":
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    case "transfer_in":
      return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
    case "transfer_out":
      return <ArrowRightLeft className="h-4 w-4 text-orange-500" />;
    default:
      return null;
  }
};

function AccountCard({ account }: { account: AccountBalance }) {
  const hasMovements = account.movements.length > 0;

  return (
    <AccordionItem value={account.accountName} className="border rounded-lg px-4">
      <AccordionTrigger className="hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-muted">
              {getAccountIcon(account.accountType)}
            </div>
            <div className="text-left">
              <p className="font-semibold">{account.accountName}</p>
              <p className="text-sm text-muted-foreground">
                {getAccountTypeLabel(account.accountType)} • {account.movements.length} movimientos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Entradas</p>
              <p className="font-medium text-emerald-600">
                +{formatCurrency(account.totalIncome)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Salidas</p>
              <p className="font-medium text-red-600">
                -{formatCurrency(account.totalExpense)}
              </p>
            </div>
            <div className="text-right min-w-[120px]">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p
                className={`font-bold text-lg ${
                  account.netBalance >= 0 ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {formatCurrency(account.netBalance)}
              </p>
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {hasMovements ? (
          <div className="pt-2 pb-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Negocio</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {account.movements.map((movement, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">
                      {formatDate(movement.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.type)}
                        <span>{movement.description}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {movement.businessName || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          movement.type === "income" || movement.type === "transfer_in"
                            ? "text-emerald-600"
                            : "text-red-600"
                        }
                      >
                        {movement.type === "income" || movement.type === "transfer_in"
                          ? "+"
                          : "-"}
                        {formatCurrency(movement.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(movement.balance)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-4">
            No hay movimientos en este período
          </p>
        )}
      </AccordionContent>
    </AccordionItem>
  );
}

export function AccountBalancesReport({ businessId, period }: AccountBalancesReportProps) {
  const { data: accounts, isLoading, error } = useAccountBalances(businessId, period);
  const { data: businesses } = useBusinesses();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-destructive">
          Error al cargar los saldos de cuentas
        </CardContent>
      </Card>
    );
  }

  const totalBalance = accounts?.reduce((sum, acc) => sum + acc.netBalance, 0) || 0;
  const totalIncome = accounts?.reduce((sum, acc) => sum + acc.totalIncome, 0) || 0;
  const totalExpense = accounts?.reduce((sum, acc) => sum + acc.totalExpense, 0) || 0;

  const handleExportPDF = () => {
    if (!accounts) return;
    
    const businessName = businessId === 'all' 
      ? 'Todos los negocios' 
      : businesses?.find(b => b.id === businessId)?.name || 'Negocio';
    
    exportAccountBalancesReportToPDF({
      accounts,
      totalIncome,
      totalExpense,
      totalBalance,
      periodLabel: getPeriodLabel(period),
      businessName,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle>Saldos por Cuenta</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <FileDown className="h-4 w-4 mr-1" />
              Exportar PDF
            </Button>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-muted-foreground">Total Entradas</p>
              <p className="font-bold text-emerald-600">+{formatCurrency(totalIncome)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Total Salidas</p>
              <p className="font-bold text-red-600">-{formatCurrency(totalExpense)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Saldo Total</p>
              <p className={`font-bold text-xl ${totalBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-2">
          {accounts?.map((account) => (
            <AccountCard key={account.accountName} account={account} />
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
