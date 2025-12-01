import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension === 'csv' || extension === 'xlsx' || extension === 'xls') {
        setFile(selectedFile);
        toast.success(`Archivo cargado: ${selectedFile.name}`);
      } else {
        toast.error('Por favor selecciona un archivo CSV o Excel válido');
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Por favor selecciona un archivo primero');
      return;
    }

    setIsProcessing(true);
    
    // Simulación de importación
    setTimeout(() => {
      toast.success('Transacciones importadas exitosamente');
      setIsProcessing(false);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onOpenChange(false);
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    toast.success('Descargando plantilla de ejemplo...');
    // Aquí iría la lógica para descargar la plantilla
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Transacciones desde CSV/Excel</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Upload className="h-4 w-4" />
              Cargar Archivo
            </h3>
            
            <div
              className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-6 transition-colors hover:border-primary hover:bg-secondary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-center text-sm font-medium">
                Haz clic para seleccionar un archivo
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Formatos: CSV, XLSX, XLS
              </p>
              {file && (
                <p className="mt-3 rounded-md bg-primary/10 px-3 py-1 text-sm text-primary">
                  {file.name}
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            <Button
              onClick={handleImport}
              disabled={!file || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Procesando...' : 'Importar Transacciones'}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <FileSpreadsheet className="h-4 w-4" />
              Formato Requerido
            </h3>
            
            <p className="text-xs text-muted-foreground">
              El archivo debe contener las siguientes columnas:
            </p>

            <div className="rounded-lg border border-border bg-secondary/30 p-3">
              <ol className="space-y-1.5 text-xs">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span><strong>Fecha</strong> (DD/MM/YYYY)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span><strong>Tipo</strong> (Ingreso/Egreso/Transferencia)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span><strong>Negocio</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span><strong>Categoría</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">5.</span>
                  <span><strong>Monto</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">6.</span>
                  <span><strong>Cuenta Origen</strong> (transferencias)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">7.</span>
                  <span><strong>Cuenta Destino</strong> (transferencias)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">8.</span>
                  <span><strong>Descripción</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">9.</span>
                  <span><strong>Referencia</strong> (opcional)</span>
                </li>
              </ol>
            </div>

            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="w-full gap-2"
              size="sm"
            >
              <Download className="h-3 w-3" />
              Descargar Plantilla
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
