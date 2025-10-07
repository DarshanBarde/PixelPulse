import { Component, type OnInit, type ElementRef, ViewChild, type OnDestroy, type AfterViewInit } from "@angular/core"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"

@Component({
  selector: "app-main-content",
  templateUrl: "./main-content.component.html",
  styleUrls: ["./main-content.component.scss"],
})
export class MainContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild("canvas") canvasRef!: ElementRef<HTMLCanvasElement>

  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private controls!: OrbitControls
  private animationId = 0
  private currentModel: THREE.Group | null = null

  isDragging = false
  hasModel = false
  isLoading = false
  fileName = ""
  errorMessage = ""

  // Model controls
  modelScale = 1
  modelRotationX = 0
  modelRotationY = 0
  modelRotationZ = 0
  modelColor = "#8b5cf6"
  metalness = 0.5
  roughness = 0.5
  opacity = 1.0
  wireframe = false
  backgroundColor = "#1a1a2e"

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    console.log("[v0] Initializing Three.js after view init")
    setTimeout(() => {
      this.initThreeJS()
      this.animate()
    }, 100)
  }

  ngOnDestroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer?.dispose()
  }

  private initThreeJS(): void {
    if (!this.canvasRef?.nativeElement) {
      console.error("[v0] Canvas element not found!")
      return
    }

    const canvas = this.canvasRef.nativeElement
    console.log("[v0] Canvas element found, initializing Three.js scene")

    // Scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(this.backgroundColor)

    // Camera
    this.camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
    this.camera.position.set(0, 2, 5)

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    })
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // Controls
    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.05
    this.controls.minDistance = 1
    this.controls.maxDistance = 50

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    this.scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(5, 10, 5)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    this.scene.add(directionalLight)

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4)
    this.scene.add(hemisphereLight)

    // Grid
    const gridHelper = new THREE.GridHelper(10, 10, 0x6366f1, 0xe5e7eb)
    this.scene.add(gridHelper)

    // Handle window resize
    window.addEventListener("resize", () => this.onWindowResize())

    console.log("[v0] Three.js initialization complete")
  }

  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate())

    if (this.currentModel) {
      this.currentModel.rotation.x = this.modelRotationX * (Math.PI / 180)
      this.currentModel.rotation.y = this.modelRotationY * (Math.PI / 180)
      this.currentModel.rotation.z = this.modelRotationZ * (Math.PI / 180)
      this.currentModel.scale.setScalar(this.modelScale)
    }

    this.controls?.update()
    this.renderer?.render(this.scene, this.camera)
  }

  private onWindowResize(): void {
    if (!this.canvasRef?.nativeElement) return

    const canvas = this.canvasRef.nativeElement
    this.camera.aspect = canvas.clientWidth / canvas.clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = true
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = false
  }

  onDrop(event: DragEvent): void {
    event.preventDefault()
    this.isDragging = false

    const files = event.dataTransfer?.files
    if (files && files.length > 0) {
      this.loadFile(files[0])
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      this.loadFile(input.files[0])
    }
  }

  private loadFile(file: File): void {
    if (!file.name.toLowerCase().endsWith(".glb") && !file.name.toLowerCase().endsWith(".gltf")) {
      this.errorMessage = "Please upload a .glb or .gltf file"
      return
    }

    this.isLoading = true
    this.fileName = file.name
    this.errorMessage = ""

    const reader = new FileReader()
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer
      this.loadModel(arrayBuffer)
    }
    reader.onerror = () => {
      this.isLoading = false
      this.errorMessage = "Error reading file. Please try again."
    }
    reader.readAsArrayBuffer(file)
  }

  private loadModel(arrayBuffer: ArrayBuffer): void {
    const loader = new GLTFLoader()

    loader.parse(
      arrayBuffer,
      "",
      (gltf) => {
        console.log("[v0] Model loaded successfully")

        // Remove previous model
        if (this.currentModel) {
          this.scene.remove(this.currentModel)
        }

        this.currentModel = gltf.scene

        // Center and scale model
        const box = new THREE.Box3().setFromObject(this.currentModel)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())

        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim

        this.currentModel.scale.setScalar(scale)
        this.currentModel.position.sub(center.multiplyScalar(scale))

        // Enable shadows
        this.currentModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true
            child.receiveShadow = true

            const mesh = child as THREE.Mesh
            if (mesh.material) {
              // Store original material for reset
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    this.applyMaterialProperties(mat)
                  }
                })
              } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
                this.applyMaterialProperties(mesh.material)
              }
            }
          }
        })

        this.scene.add(this.currentModel)
        this.hasModel = true
        this.isLoading = false
        this.errorMessage = ""

        // Reset controls
        this.modelScale = 1
        this.modelRotationX = 0
        this.modelRotationY = 0
        this.modelRotationZ = 0

        console.log("[v0] Model added to scene")
      },
      (error) => {
        console.error("[v0] Error loading model:", error)
        this.isLoading = false
        this.errorMessage = "Error loading 3D model. Please ensure the file is a valid GLB or GLTF format."
      },
    )
  }

  private applyMaterialProperties(material: THREE.MeshStandardMaterial): void {
    material.color.set(this.modelColor)
    material.metalness = this.metalness
    material.roughness = this.roughness
    material.opacity = this.opacity
    material.transparent = this.opacity < 1
    material.wireframe = this.wireframe
    material.needsUpdate = true
  }

  public updateModelColor(): void {
    if (!this.currentModel) return

    this.currentModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.color.set(this.modelColor)
                mat.needsUpdate = true
              }
            })
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.color.set(this.modelColor)
            mesh.material.needsUpdate = true
          }
        }
      }
    })
  }

  public updateMaterial(): void {
    if (!this.currentModel) return

    this.currentModel.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.metalness = this.metalness
                mat.roughness = this.roughness
                mat.opacity = this.opacity
                mat.transparent = this.opacity < 1
                mat.wireframe = this.wireframe
                mat.needsUpdate = true
              }
            })
          } else if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.metalness = this.metalness
            mesh.material.roughness = this.roughness
            mesh.material.opacity = this.opacity
            mesh.material.transparent = this.opacity < 1
            mesh.material.wireframe = this.wireframe
            mesh.material.needsUpdate = true
          }
        }
      }
    })
  }

  public updateBackgroundColor(): void {
    this.scene.background = new THREE.Color(this.backgroundColor)
  }

  resetModel(): void {
    this.modelScale = 1
    this.modelRotationX = 0
    this.modelRotationY = 0
    this.modelRotationZ = 0
    this.modelColor = "#8b5cf6"
    this.metalness = 0.5
    this.roughness = 0.5
    this.opacity = 1.0
    this.wireframe = false
    this.backgroundColor = "#1a1a2e"

    this.updateModelColor()
    this.updateMaterial()
    this.updateBackgroundColor()
    this.controls.reset()
  }

  removeModel(): void {
    if (this.currentModel) {
      this.scene.remove(this.currentModel)
      this.currentModel = null
      this.hasModel = false
      this.fileName = ""
    }
  }

  clearError(): void {
    this.errorMessage = ""
  }
}
