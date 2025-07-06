import { Component, inject } from "@angular/core"
import { FormsModule } from "@angular/forms"
import { NgIf, NgFor } from "@angular/common"
import { CamionService } from "../../../servicios/camion.service"

type Mantencion = {
  nombre: string
  accion: string[]
  accionSeleccionada: string
  kilometraje: number | null
  meses: number | null
}

@Component({
  selector: "app-camiones",
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: "./camiones.component.html",
  styleUrls: ["./camiones.component.css"],
})
export class CamionesComponent {
  camionService = inject(CamionService)

  // Tab management
  activeTab: "vehicle" | "maintenance" = "vehicle"

  // Loading and notification states
  isSubmitting = false
  showToast = false
  toastMessage = ""
  toastType: "success" | "error" = "success"

  camion = {
    patente: "",
    tipo_vehiculo: "",
    marca: "",
    modelo: "",
    anno: "",
    color: "",
    nro_motor: "",
    nro_chasis: "",
    fabricante: "",
    procedencia: "",
    tipo_sello: "",
    combustible: "",
    kilometraje_camion: "",
    fecha_revision_tecnica: "",
  }

  tipoVehiculo = [
    "Camión",
    "Camioneta",
    "Furgón",
    "Sedán",
    "Hatchback",
    "SUV",
    "Coupé",
    "Convertible",
    "Pickup",
    "Minivan",
    "Crossover",
    "Station Wagon",
    "Microbús",
    "Autobús",
    "Motocicleta",
    "Tractor",
    "Remolque",
    "Ambulancia",
    "Grúa",
    "Tractor agrícola",
    "Limusina",
    "Deportivo",
  ]

  tiposCombustible = ["93", "95", "97", "Diesel"]
  tiposSello = ["Verde", "Rojo", "Azul"]
  currentYear: number = new Date().getFullYear()

  mantenciones: Mantencion[] = [
    { nombre: "Aceite de motor", accion: ["Cambiar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
    { nombre: "Filtro de aire", accion: ["Limpiar", "Cambiar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
    { nombre: "Revisión de frenos", accion: ["Revisar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
    { nombre: "Reemplazo de neumáticos", accion: ["Reemplazar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
    { nombre: "Revisión de tren delantero", accion: ["Revisar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
  ]

  // Tab management methods
  setActiveTab(tab: "vehicle" | "maintenance") {
    this.activeTab = tab
  }

  // Get completed maintenances count
  getCompletedMaintenances(): number {
    return this.mantenciones.filter((m) => m.accionSeleccionada && m.kilometraje !== null).length
  }

  // Verificar si todas las mantenciones están completas
  areAllMaintenancesComplete(): boolean {
    return this.mantenciones.every((m) => m.accionSeleccionada && m.kilometraje !== null)
  }

  // Obtener mantenciones incompletas
  getIncompleteMaintenances(): string[] {
    return this.mantenciones.filter((m) => !m.accionSeleccionada || m.kilometraje === null).map((m) => m.nombre)
  }

  // Verificar si el formulario básico está completo
  isBasicFormComplete(): boolean {
    return !!(
      this.camion.patente.trim() &&
      this.camion.tipo_vehiculo &&
      this.camion.marca.trim() &&
      this.camion.modelo.trim() &&
      this.camion.anno &&
      this.camion.color.trim() &&
      this.camion.nro_motor.trim() &&
      this.camion.nro_chasis.trim() &&
      this.camion.fabricante.trim() &&
      this.camion.procedencia.trim() &&
      this.camion.tipo_sello &&
      this.camion.combustible &&
      this.camion.kilometraje_camion &&
      this.camion.fecha_revision_tecnica
    )
  }

  // Verificar si se puede registrar el camión
  canRegisterTruck(): boolean {
    return this.isBasicFormComplete() && this.areAllMaintenancesComplete()
  }

  // Toast notification methods
  showToastNotification(message: string, type: "success" | "error" = "success") {
    this.toastMessage = message
    this.toastType = type
    this.showToast = true
    setTimeout(() => {
      this.showToast = false
    }, 4000)
  }

  // Método con validaciones mejoradas
  enviarFormulario() {
    // Validación de patente
    if (!this.camion.patente.trim()) {
      this.showToastNotification("La patente es obligatoria", "error")
      this.setActiveTab("vehicle")
      return
    }

    // Validación de formulario básico
    if (!this.isBasicFormComplete()) {
      this.showToastNotification("Por favor completa todos los campos del vehículo", "error")
      this.setActiveTab("vehicle")
      return
    }

    // Verificar mantenciones completas
    if (!this.areAllMaintenancesComplete()) {
      const incompleteMaintenances = this.getIncompleteMaintenances()
      const completedCount = this.getCompletedMaintenances()
      const totalCount = this.mantenciones.length
      this.showToastNotification(
        `Faltan ${totalCount - completedCount} mantenciones por completar: ${incompleteMaintenances.join(", ")}`,
        "error",
      )
      this.setActiveTab("maintenance")
      return
    }

    this.isSubmitting = true
    const currentKm = Number(this.camion.kilometraje_camion)

    const datosCamion = {
      patente: this.camion.patente,
      tipo: this.camion.tipo_vehiculo,
      marca: this.camion.marca,
      modelo: this.camion.modelo,
      anno: this.camion.anno,
      color: this.camion.color,
      nro_motor: this.camion.nro_motor,
      nro_chasis: this.camion.nro_chasis,
      fabricante: this.camion.fabricante,
      procedencia: this.camion.procedencia,
      tipo_sello: this.camion.tipo_sello,
      combustible: this.camion.combustible,
      kilometraje_camion: this.camion.kilometraje_camion,
      fecha_revision_tecnica: this.camion.fecha_revision_tecnica,
      mantenciones: this.mantenciones
        .filter((m) => m.accionSeleccionada && m.kilometraje !== null)
        .map((m) => {
          const meses = m.meses ?? 0
          return {
            nombre: m.nombre,
            accion: m.accionSeleccionada,
            kilometraje: m.kilometraje,
            meses,
            proximoKilometraje: currentKm + Number(m.kilometraje),
          }
        }),
    }

    this.camionService.crearCamion(datosCamion).subscribe({
      next: (respuesta) => {
        this.showToastNotification("¡Camión registrado correctamente!", "success")
        console.log(respuesta)
        this.resetFormulario()
        this.isSubmitting = false
      },
      error: (error) => {
        console.error("Error al guardar camión:", error)
        this.showToastNotification("Error al guardar en DB, guardando en LocalStorage", "error")
        this.guardarCamionLocal(datosCamion)
        this.resetFormulario()
        this.isSubmitting = false
      },
    })
  }

  resetFormulario() {
    this.camion = {
      patente: "",
      tipo_vehiculo: "",
      marca: "",
      modelo: "",
      anno: "",
      color: "",
      nro_motor: "",
      nro_chasis: "",
      fabricante: "",
      procedencia: "",
      tipo_sello: "",
      combustible: "",
      kilometraje_camion: "",
      fecha_revision_tecnica: "",
    }

    this.mantenciones = [
      { nombre: "Aceite de motor", accion: ["Cambiar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
      { nombre: "Filtro de aire", accion: ["Limpiar", "Cambiar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
      { nombre: "Revisión de frenos", accion: ["Revisar"], accionSeleccionada: "", kilometraje: null, meses: 0 },
      {
        nombre: "Reemplazo de neumáticos",
        accion: ["Reemplazar"],
        accionSeleccionada: "",
        kilometraje: null,
        meses: 0,
      },
      {
        nombre: "Revisión de tren delantero",
        accion: ["Revisar"],
        accionSeleccionada: "",
        kilometraje: null,
        meses: 0,
      },
    ]

    // Reset to first tab
    this.activeTab = "vehicle"
  }

  guardarCamionLocal(camion: any): void {
    const camionesGuardados: any[] = JSON.parse(localStorage.getItem("camiones") || "[]")
    camionesGuardados.push(camion)
    localStorage.setItem("camiones", JSON.stringify(camionesGuardados))
  }

  obtenerCamionesLocales(): any[] {
    return JSON.parse(localStorage.getItem("camiones") || "[]")
  }
}
