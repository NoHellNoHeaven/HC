export interface Alert {
  id: string;
  truck_id: string;
  truck?: any;
  alert_type: 'maintenance' | 'document_expiry' | 'inspection' | 'mileage';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'resolved';
  due_date: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  assigned_driver_id?: string;
  assigned_driver?: any;
}