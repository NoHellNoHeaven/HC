import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { Truck } from '../models/truck.model';
import { Alert } from '../models/alert.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  generateFleetReportPDF(trucks: Truck[], alerts: Alert[]) {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('Reporte de Flota de Camiones', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    doc.text(`Total de camiones: ${trucks.length}`, 20, 40);
    doc.text(`Alertas pendientes: ${alerts.filter(a => a.status === 'pending').length}`, 20, 50);

    // Trucks table
    const truckData = trucks.map(truck => [
      truck.plate_number,
      `${truck.brand} ${truck.model}`,
      truck.year.toString(),
      truck.current_mileage.toLocaleString(),
      truck.status,
      truck.assigned_driver?.full_name || 'Sin asignar'
    ]);

    autoTable(doc, {
      head: [['Patente', 'Vehículo', 'Año', 'Kilometraje', 'Estado', 'Conductor']],
      body: truckData,
      startY: 70,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 64, 175] }
    });

    // Alerts section
    if (alerts.length > 0) {
      const alertsStartY = (doc as any).lastAutoTable.finalY + 20;
      doc.setFontSize(16);
      doc.text('Alertas Activas', 20, alertsStartY);

      const alertData = alerts
        .filter(alert => alert.status === 'pending')
        .map(alert => [
          alert.truck?.plate_number || '',
          alert.title,
          alert.priority,
          new Date(alert.due_date).toLocaleDateString('es-ES'),
          alert.status
        ]);

      autoTable(doc, {
        head: [['Patente', 'Alerta', 'Prioridad', 'Fecha Venc.', 'Estado']],
        body: alertData,
        startY: alertsStartY + 10,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [234, 88, 12] }
      });
    }

    doc.save(`reporte-flota-${new Date().getTime()}.pdf`);
  }

  generateDriverReportPDF(drivers: User[], trucks: Truck[]) {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Reporte de Conductores', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    doc.text(`Total de conductores: ${drivers.length}`, 20, 40);

    const driverData = drivers.map(driver => {
      const assignedTruck = trucks.find(t => t.assigned_driver_id === driver.id);
      return [
        driver.full_name,
        driver.email,
        driver.phone || 'N/A',
        driver.license_number || 'N/A',
        driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString('es-ES') : 'N/A',
        assignedTruck?.plate_number || 'Sin asignar',
        driver.status
      ];
    });

    autoTable(doc, {
      head: [['Nombre', 'Email', 'Teléfono', 'Licencia', 'Venc. Licencia', 'Camión Asignado', 'Estado']],
      body: driverData,
      startY: 60,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] }
    });

    doc.save(`reporte-conductores-${new Date().getTime()}.pdf`);
  }

  generateMaintenanceReportPDF(maintenanceRecords: any[]) {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Reporte de Mantenimientos', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);
    doc.text(`Total de registros: ${maintenanceRecords.length}`, 20, 40);

    const maintenanceData = maintenanceRecords.map(record => [
      record.truck?.plate_number || '',
      record.maintenance_type,
      record.description,
      `$${record.cost.toLocaleString()}`,
      record.mileage_at_maintenance.toLocaleString(),
      new Date(record.performed_date).toLocaleDateString('es-ES'),
      record.performed_by
    ]);

    autoTable(doc, {
      head: [['Patente', 'Tipo', 'Descripción', 'Costo', 'Kilometraje', 'Fecha', 'Realizado por']],
      body: maintenanceData,
      startY: 60,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 64, 175] }
    });

    doc.save(`reporte-mantenimientos-${new Date().getTime()}.pdf`);
  }

  async generateFleetReportDOCX(trucks: Truck[], alerts: Alert[]) {
    // Simple DOCX generation - in a real app, you'd want a template
    const content = `
REPORTE DE FLOTA DE CAMIONES
============================

Fecha de generación: ${new Date().toLocaleDateString('es-ES')}
Total de camiones: ${trucks.length}
Alertas pendientes: ${alerts.filter(a => a.status === 'pending').length}

CAMIONES:
${trucks.map(truck => `
- ${truck.plate_number} (${truck.brand} ${truck.model} ${truck.year})
  Kilometraje: ${truck.current_mileage.toLocaleString()} km
  Estado: ${truck.status}
  Conductor: ${truck.assigned_driver?.full_name || 'Sin asignar'}
`).join('')}

ALERTAS PENDIENTES:
${alerts.filter(a => a.status === 'pending').map(alert => `
- ${alert.title} (${alert.truck?.plate_number})
  Prioridad: ${alert.priority}
  Vencimiento: ${new Date(alert.due_date).toLocaleDateString('es-ES')}
`).join('')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, `reporte-flota-${new Date().getTime()}.txt`);
  }
}