import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { BETTER_AUTH_OPEN_API_SCHEMA } from "./auth";
import { Controller } from "./controller.elysia";

import openapi from "@elysiajs/openapi";
import Elysia from "elysia";
import { opentelemetry } from "@elysiajs/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";

export class ElysiaApiAdapter {
  private controller: Controller
  public app: Elysia

  constructor(
    computerService: ComputerService,
    deviceService: DeviceService,
    medicalDeviceService: MedicalDeviceService
  ) {
    this.controller = new Controller(
      computerService,
      deviceService,
      medicalDeviceService
    )

    this.app = new Elysia()
      .use(opentelemetry({
        spanProcessors: [
          new BatchSpanProcessor(
            new OTLPTraceExporter({
              url: 'https://api.axiom.co/v1/traces',
              headers: {
    						Authorization: `Bearer ${Bun.env.AXIOM_TOKEN}`, 
    						'X-Axiom-Dataset': `${Bun.env.AXIOM_DATASET}`
    					}
            })
          )
        ]
      }))
      .use(this.controller.routes())
  }

  async run() {
    console.log(Bun.env.AXIOM_TOKEN)
    console.log(Bun.env.AXIOM_DATASET)

    this.app
      .use(openapi({
        documentation: {
          components: await BETTER_AUTH_OPEN_API_SCHEMA.components,
          paths: await BETTER_AUTH_OPEN_API_SCHEMA.getPaths()
        }
      }))
      .listen(3000)

    console.log("El servidor esta corriendo en el puerto 3000")
  }
}
