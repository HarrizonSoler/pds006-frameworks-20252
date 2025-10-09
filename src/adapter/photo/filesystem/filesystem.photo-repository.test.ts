import { DevicePhotoRepository } from "@/core/repository"
import { FileSystemPhotoRepository } from "./filesystem.photo-repository"
import { beforeAll, describe, expect, it } from "bun:test"
import { DeviceId } from "@/core/domain"

async function createTestImageFile(): Promise<File> {
  const pngBytes = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG header
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89,
    0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0x00, 0x00, 0x03,
    0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0x18, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
  ])
  return new File([pngBytes], "test.png", { type: "image/png" })
}

describe("DevicePhotoRepository", () => {
  let repo: DevicePhotoRepository
  let imageFile: File
  let uploadedUrl: URL
  const testDeviceId: DeviceId = "test-device-id"

  beforeAll(async () => {
    /*
      Cambia al constructor de tu implementación
      Ej: new AzurePhotoRepository()
    */
    repo = new FileSystemPhotoRepository()
    imageFile = await createTestImageFile()
  })

  it("should upload an image and return a valid URL", async () => {
    uploadedUrl = await repo.savePhoto(imageFile, testDeviceId)
    expect(uploadedUrl).toBeInstanceOf(URL)
    expect(uploadedUrl.href.length).toBeGreaterThan(0)
  })

  it("should return the same image data when fetched from the URL", async () => {
    const res = await fetch(uploadedUrl)
    expect(res.ok).toBe(true)
    const returnedBytes = new Uint8Array(await res.arrayBuffer())
    const originalBytes = new Uint8Array(await imageFile.arrayBuffer())
    expect(returnedBytes).toEqual(originalBytes)
  })
})

