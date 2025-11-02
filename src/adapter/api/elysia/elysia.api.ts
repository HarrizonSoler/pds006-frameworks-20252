import { ComputerService, DeviceService, MedicalDeviceService } from "@/core/service";
import { auth, authMiddleware, BETTER_AUTH_OPEN_API_SCHEMA } from "./auth";
import { Controller } from "./controller.elysia";

import openapi from "@elysiajs/openapi";
import Elysia from "elysia";

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
      .use(this.controller.routes())
  }

  async run() {
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
