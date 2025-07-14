import { Component, type OnInit, inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { NavbarComponent } from "../navbar/navbar.component"
import { CamionService } from "../../servicios/camion.service"

@Component({
  selector: "app-mantenciones-pendientes",
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: "./mantenciones-pendientes.component.html",
  styleUrls: ["./mantenciones-pendientes.component.css"],
})
export class MantencionesPendientesComponent implements OnInit {
  camionService = inject(CamionService)

  camion: any = null
  mantencionesPendientes: any[] = []
  mantencionesProximas: any[] = []

  mantencionAConfirmar: any = null
  mostrarModal: boolean = false

  ngOnInit(): void {
    this.camionService.camionSeleccionado$.subscribe((camion) => {
      if (!camion) {
        alert("No hay camión seleccionado")
        return
      }

      this.camion = camion
      this.procesarMantenciones()
    })
  }

  procesarMantenciones(): void {
    this.mantencionesPendientes = []
    this.mantencionesProximas = []

    const kmActual = Number(this.camion.kilometraje_camion)
    const hoy = new Date()

    for (const mantencion of this.camion.mantenciones || []) {
      const proximoKm = Number(mantencion.proximoKilometraje)
      const meses = Number(mantencion.meses)

      // Calcular fecha de vencimiento basada en el mes actual + meses asignados
      let fechaVencimiento = null
      if (meses > 0) {
        const fechaBase = new Date()
        fechaBase.setDate(1) // Primer día del mes actual
        fechaVencimiento = new Date(fechaBase)
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + meses)
      }

      // Una mantención está vencida si supera el kilometraje O si tiene fecha y ya venció
      const vencida = kmActual >= proximoKm || (fechaVencimiento && fechaVencimiento <= hoy)

      const item = {
        nombre: this.camion.patente,
        fecha: fechaVencimiento,
        descripcion: `${mantencion.nombre} - ${mantencion.accion || "Mantenimiento requerido"}`,
        tipo: "Mantenimiento",
        criticidad: "Crítico",
        kmProgramado: proximoKm,
        kmActual: kmActual,
        mantencionOriginal: mantencion,
      }

      if (vencida) {
        this.mantencionesPendientes.push(item)
      } else {
        this.mantencionesProximas.push(item)
      }
    }
  }

  confirmarMantencion(mantencion: any) {
    this.mantencionAConfirmar = mantencion
    this.mostrarModal = true
  }

  cancelarConfirmacion() {
    this.mantencionAConfirmar = null
    this.mostrarModal = false
  }

completarMantencion() {
  const kmActual = Number(this.camion.kilometraje_camion)
  const mantencion = this.mantencionAConfirmar
  const fechaRealizacion = new Date()

  if (!this.camion.historialMantenciones) {
    this.camion.historialMantenciones = []
  }

  this.camion.historialMantenciones.push({
    nombre: mantencion.mantencionOriginal.nombre,
    accion: mantencion.mantencionOriginal.accion || "Mantenimiento realizado",
    fechaRealizada: fechaRealizacion.toISOString(),
    kilometrajeRealizado: kmActual,
  })

  // Calcular nueva fecha de vencimiento basada en la fecha de realización
  let nuevaFechaVencimiento = null
  const meses = Number(mantencion.mantencionOriginal.meses)
  if (meses > 0) {
    const fechaBase = new Date(fechaRealizacion)
    fechaBase.setDate(1) // Primer día del mes de realización
    nuevaFechaVencimiento = new Date(fechaBase)
    nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + meses)
  }

  const nuevaMantencion = {
    ...mantencion.mantencionOriginal,
    proximoKilometraje: kmActual + Number(mantencion.mantencionOriginal.kilometraje),
    fechaVencimiento: nuevaFechaVencimiento ? nuevaFechaVencimiento.toISOString() : null,
  }

  this.camion.kilometraje_camion = kmActual

  const indexMant = this.camion.mantenciones.findIndex((m: any) => m === mantencion.mantencionOriginal)
  if (indexMant !== -1) {
    this.camion.mantenciones[indexMant] = nuevaMantencion
  }

  // *** Usar servicio para obtener y actualizar camiones
  const camionesGuardados = this.camionService.getCamiones()
  const camionIndex = camionesGuardados.findIndex(c => c.patente === this.camion.patente)

  if (camionIndex !== -1) {
    camionesGuardados[camionIndex] = this.camion

    // Guardar todo el array actualizado
    this.camionService.setCamiones(camionesGuardados)

    // Actualizar camión seleccionado reactivo
    this.camionService.setCamionSeleccionado(this.camion)
  }

  this.cancelarConfirmacion()
  this.procesarMantenciones()
}


  getKmStatusText(mantencion: any): string {
    const diferencia = mantencion.kmActual - mantencion.kmProgramado
    if (diferencia > 0) return `+${diferencia.toLocaleString()} km excedido`
    if (diferencia === 0) return "Kilometraje alcanzado"
    return `${Math.abs(diferencia).toLocaleString()} km restantes`
  }

  getKmStatusClass(mantencion: any): string {
    const diferencia = mantencion.kmActual - mantencion.kmProgramado
    if (diferencia > 0) return "km-status-exceeded"
    if (diferencia === 0) return "km-status-reached"
    return "km-status-pending"
  }
}
