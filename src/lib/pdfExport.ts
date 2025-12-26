import jsPDF from 'jspdf';

interface ChartAccountBalance {
  code: string;
  name: string;
  balance: number;
  category: string;
}

interface IncomeStatementData {
  incomeAccounts: ChartAccountBalance[];
  expenseAccounts: ChartAccountBalance[];
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  periodLabel: string;
  businessName: string;
}

interface BalanceSheetData {
  assetAccounts: ChartAccountBalance[];
  liabilityAccounts: ChartAccountBalance[];
  equityAccounts: ChartAccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  periodLabel: string;
  businessName: string;
}

interface AccountMovement {
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer_in' | 'transfer_out';
  amount: number;
  balance: number;
  businessName?: string;
}

interface PaymentAccountBalance {
  accountName: string;
  accountType: string;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  movements: AccountMovement[];
}

interface AccountBalancesReportData {
  accounts: PaymentAccountBalance[];
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  periodLabel: string;
  businessName: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(amount);
};

const groupByCategory = (accounts: ChartAccountBalance[]): Record<string, ChartAccountBalance[]> => {
  return accounts.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ChartAccountBalance[]>);
};

const getAccountTypeLabel = (type: string): string => {
  switch (type) {
    case 'bank': return 'Banco';
    case 'wallet': return 'Billetera Digital';
    case 'cash': return 'Efectivo';
    default: return type;
  }
};

const formatDatePDF = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export function exportIncomeStatementToPDF(data: IncomeStatementData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ESTADO DE RESULTADOS', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.businessName, pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.text(`Periodo: ${data.periodLabel}`, pageWidth / 2, y, { align: 'center' });
  
  y += 15;

  // INGRESOS Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('INGRESOS', 20, y);
  doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 10;

  const groupedIncome = groupByCategory(data.incomeAccounts);
  
  if (Object.keys(groupedIncome).length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin ingresos registrados', 25, y);
    y += 8;
  } else {
    for (const [category, accounts] of Object.entries(groupedIncome)) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(category, 25, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      for (const account of accounts) {
        doc.text(`${account.code} - ${account.name}`, 30, y);
        doc.text(formatCurrency(account.balance), pageWidth - 25, y, { align: 'right' });
        y += 5;
      }
      y += 3;
    }
  }

  // Total Ingresos
  doc.setFont('helvetica', 'bold');
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.text('Total Ingresos', 25, y);
  doc.text(formatCurrency(data.totalIncome), pageWidth - 25, y, { align: 'right' });
  y += 15;

  // EGRESOS Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('EGRESOS', 20, y);
  doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 10;

  const groupedExpenses = groupByCategory(data.expenseAccounts);
  
  if (Object.keys(groupedExpenses).length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin egresos registrados', 25, y);
    y += 8;
  } else {
    for (const [category, accounts] of Object.entries(groupedExpenses)) {
      // Check if we need a new page
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(category, 25, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      for (const account of accounts) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${account.code} - ${account.name}`, 30, y);
        doc.text(formatCurrency(account.balance), pageWidth - 25, y, { align: 'right' });
        y += 5;
      }
      y += 3;
    }
  }

  // Total Egresos
  doc.setFont('helvetica', 'bold');
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.text('Total Egresos', 25, y);
  doc.text(formatCurrency(data.totalExpenses), pageWidth - 25, y, { align: 'right' });
  y += 15;

  // RESULTADO NETO
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor(0, 100, 200);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;
  doc.text('RESULTADO NETO DEL PERIODO', 25, y);
  doc.text(formatCurrency(data.netIncome), pageWidth - 25, y, { align: 'right' });

  // Footer
  const today = new Date().toLocaleDateString('es-PE');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${today}`, pageWidth / 2, 285, { align: 'center' });

  doc.save(`estado-resultados-${data.periodLabel.replace(/\s/g, '-')}.pdf`);
}

export function exportBalanceSheetToPDF(data: BalanceSheetData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BALANCE GENERAL', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.businessName, pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.text(`Al cierre de: ${data.periodLabel}`, pageWidth / 2, y, { align: 'center' });
  
  y += 15;

  // ACTIVOS Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVOS', 20, y);
  doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 10;

  const groupedAssets = groupByCategory(data.assetAccounts);
  
  if (Object.keys(groupedAssets).length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin activos registrados', 25, y);
    y += 8;
  } else {
    for (const [category, accounts] of Object.entries(groupedAssets)) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(category, 25, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      for (const account of accounts) {
        doc.text(`${account.code} - ${account.name}`, 30, y);
        doc.text(formatCurrency(account.balance), pageWidth - 25, y, { align: 'right' });
        y += 5;
      }
      y += 3;
    }
  }

  // Total Activos
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor(0, 100, 200);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.setFontSize(11);
  doc.text('TOTAL ACTIVOS', 25, y);
  doc.text(formatCurrency(data.totalAssets), pageWidth - 25, y, { align: 'right' });
  y += 15;

  // PASIVOS Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.text('PASIVOS', 20, y);
  doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 10;

  const groupedLiabilities = groupByCategory(data.liabilityAccounts);
  
  if (Object.keys(groupedLiabilities).length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin pasivos registrados', 25, y);
    y += 8;
  } else {
    for (const [category, accounts] of Object.entries(groupedLiabilities)) {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(category, 25, y);
      y += 6;
      
      doc.setFont('helvetica', 'normal');
      for (const account of accounts) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${account.code} - ${account.name}`, 30, y);
        doc.text(formatCurrency(account.balance), pageWidth - 25, y, { align: 'right' });
        y += 5;
      }
      y += 3;
    }
  }

  // Total Pasivos
  doc.setFont('helvetica', 'bold');
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.text('Total Pasivos', 25, y);
  doc.text(formatCurrency(data.totalLiabilities), pageWidth - 25, y, { align: 'right' });
  y += 12;

  // PATRIMONIO Section
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PATRIMONIO', 20, y);
  doc.line(20, y + 2, pageWidth - 20, y + 2);
  y += 10;

  if (data.equityAccounts.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Sin patrimonio registrado', 25, y);
    y += 8;
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    for (const account of data.equityAccounts) {
      doc.text(`${account.code} - ${account.name}`, 30, y);
      doc.text(formatCurrency(account.balance), pageWidth - 25, y, { align: 'right' });
      y += 5;
    }
  }

  // Total Patrimonio
  doc.setFont('helvetica', 'bold');
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.text('Total Patrimonio', 25, y);
  doc.text(formatCurrency(data.totalEquity), pageWidth - 25, y, { align: 'right' });
  y += 10;

  // TOTAL PASIVOS + PATRIMONIO
  doc.setDrawColor(0, 100, 200);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 6;
  doc.setFontSize(11);
  doc.text('TOTAL PASIVOS + PATRIMONIO', 25, y);
  doc.text(formatCurrency(data.totalLiabilities + data.totalEquity), pageWidth - 25, y, { align: 'right' });
  y += 15;

  // Ecuación contable
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, pageWidth - 40, 20, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ecuacion Contable: Activos = Pasivos + Patrimonio', pageWidth / 2, y + 7, { align: 'center' });
  
  const isBalanced = Math.abs(data.totalAssets - (data.totalLiabilities + data.totalEquity)) < 0.01;
  doc.setFont('helvetica', 'bold');
  const balanceText = `${formatCurrency(data.totalAssets)} = ${formatCurrency(data.totalLiabilities + data.totalEquity)}${isBalanced ? '' : ' (Desbalanceado)'}`;
  doc.text(balanceText, pageWidth / 2, y + 15, { align: 'center' });

  // Footer
  const today = new Date().toLocaleDateString('es-PE');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${today}`, pageWidth / 2, 285, { align: 'center' });

  doc.save(`balance-general-${data.periodLabel.replace(/\s/g, '-')}.pdf`);
}

export function exportAccountBalancesReportToPDF(data: AccountBalancesReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORTE DE SALDOS POR CUENTA', pageWidth / 2, y, { align: 'center' });
  
  y += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.businessName, pageWidth / 2, y, { align: 'center' });
  
  y += 8;
  doc.setFontSize(10);
  doc.text(`Periodo: ${data.periodLabel}`, pageWidth / 2, y, { align: 'center' });
  
  y += 15;

  // Summary section
  doc.setFillColor(240, 240, 240);
  doc.rect(20, y, pageWidth - 40, 25, 'F');
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  y += 8;
  doc.text('Total Entradas:', 30, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totalIncome), 70, y);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total Salidas:', 100, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totalExpense), 135, y);
  
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('Saldo Total:', 30, y);
  doc.setFont('helvetica', 'normal');
  doc.text(formatCurrency(data.totalBalance), 70, y);
  
  y += 20;

  // Accounts section
  for (const account of data.accounts) {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    // Account header
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setDrawColor(0, 100, 200);
    doc.setLineWidth(0.5);
    doc.line(20, y, pageWidth - 20, y);
    y += 6;
    
    doc.text(account.accountName, 20, y);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`(${getAccountTypeLabel(account.accountType)})`, 20 + doc.getTextWidth(account.accountName) + 3, y);
    
    // Account summary on the right
    doc.setFontSize(9);
    const summaryX = pageWidth - 20;
    doc.text(`Saldo: ${formatCurrency(account.netBalance)}`, summaryX, y, { align: 'right' });
    
    y += 5;
    doc.setFontSize(8);
    doc.text(`Entradas: ${formatCurrency(account.totalIncome)}  |  Salidas: ${formatCurrency(account.totalExpense)}`, 25, y);
    
    y += 8;

    // Movements table
    if (account.movements.length > 0) {
      // Table header
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(25, y, pageWidth - 25, y);
      y += 4;
      doc.text('Fecha', 25, y);
      doc.text('Descripcion', 50, y);
      doc.text('Monto', 130, y, { align: 'right' });
      doc.text('Saldo', pageWidth - 25, y, { align: 'right' });
      y += 2;
      doc.line(25, y, pageWidth - 25, y);
      y += 4;

      doc.setFont('helvetica', 'normal');
      for (const movement of account.movements) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.text(formatDatePDF(movement.date), 25, y);
        
        // Truncate description if too long
        const maxDescLength = 60;
        const desc = movement.description.length > maxDescLength 
          ? movement.description.substring(0, maxDescLength) + '...' 
          : movement.description;
        doc.text(desc, 50, y);
        
        const amountSign = movement.type === 'income' || movement.type === 'transfer_in' ? '+' : '-';
        doc.text(`${amountSign}${formatCurrency(movement.amount)}`, 130, y, { align: 'right' });
        doc.text(formatCurrency(movement.balance), pageWidth - 25, y, { align: 'right' });
        
        y += 4;
      }
    } else {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Sin movimientos en este periodo', 25, y);
      y += 4;
    }

    y += 8;
  }

  // Footer
  const today = new Date().toLocaleDateString('es-PE');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generado el ${today}`, pageWidth / 2, 285, { align: 'center' });

  doc.save(`saldos-por-cuenta-${data.periodLabel.replace(/\s/g, '-')}.pdf`);
}
