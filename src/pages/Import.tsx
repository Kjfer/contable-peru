import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Import() {
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
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    toast.success('Descargando plantilla de ejemplo...');
    // Aquí iría la lógica para descargar la plantilla
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Importar Transacciones</h1>
        <p className="mt-1 text-muted-foreground">Carga masiva de datos desde Excel o CSV</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Upload className="h-5 w-5" />
            Cargar Archivo
          </h3>
          
          <div className="space-y-4">
            <div
              className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 p-8 transition-colors hover:border-primary hover:bg-secondary/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileSpreadsheet className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-center text-sm font-medium">
                Haz clic para seleccionar un archivo
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Formatos aceptados: CSV, XLSX, XLS
              </p>
              {file && (
                <p className="mt-4 rounded-md bg-primary/10 px-3 py-1 text-sm text-primary">
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
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <FileSpreadsheet className="h-5 w-5" />
            Formato Requerido
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              El archivo debe contener las siguientes columnas en orden:
            </p>

            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">1.</span>
                  <span><strong>Fecha</strong> (formato: DD/MM/YYYY)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">2.</span>
                  <span><strong>Tipo</strong> (Ingreso, Egreso, Transferencia)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">3.</span>
                  <span><strong>Negocio</strong> (nombre del negocio)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">4.</span>
                  <span><strong>Categoría</strong> (ID de categoría)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">5.</span>
                  <span><strong>Monto</strong> (número decimal)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">6.</span>
                  <span><strong>Cuenta Origen</strong> (para transferencias)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-primary">7.</span>
                  <span><strong>Cuenta Destino</strong> (para transferencias)</span>
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
            >
              <Download className="h-4 w-4" />
              Descargar Plantilla de Ejemplo
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
