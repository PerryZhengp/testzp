import {
  AmbientLight,
  CanvasTexture,
  BoxGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Line,
  LineBasicMaterial,
  BufferGeometry,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  Sprite,
  SpriteMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  Object3D
} from 'three';
import { CameraController } from '../camera/camera-controller';
import type { LevelDef, Scalar, WalkGraph } from '../../shared/types/game';
import { scalarKey } from '../../shared/utils/math';

interface LevelRuntimeLike {
  level: LevelDef;
  anchors: Record<string, { worldPosition: [number, number, number]; worldRotationDeg: [number, number, number] }>;
  graph: WalkGraph;
  currentNodeId: string;
  interactableValues: Record<string, Scalar>;
}

function createLabelSprite(text: string, color = '#d8edff'): Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new Sprite();
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(8, 20, 39, 0.74)';
  ctx.strokeStyle = 'rgba(189, 225, 255, 0.66)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const radius = 20;
  ctx.moveTo(radius, 6);
  ctx.lineTo(canvas.width - radius, 6);
  ctx.quadraticCurveTo(canvas.width - 6, 6, canvas.width - 6, radius);
  ctx.lineTo(canvas.width - 6, canvas.height - radius);
  ctx.quadraticCurveTo(canvas.width - 6, canvas.height - 6, canvas.width - radius, canvas.height - 6);
  ctx.lineTo(radius, canvas.height - 6);
  ctx.quadraticCurveTo(6, canvas.height - 6, 6, canvas.height - radius);
  ctx.lineTo(6, radius);
  ctx.quadraticCurveTo(6, 6, radius, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = color;
  ctx.font = '600 42px PingFang SC, Noto Sans SC, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;

  const material = new SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  });

  const sprite = new Sprite(material);
  sprite.scale.set(1.8, 0.45, 1);
  return sprite;
}

export class SceneManager {
  readonly scene: Scene;

  readonly renderer: WebGLRenderer;

  readonly cameraController: CameraController;

  private readonly worldGroup = new Group();

  private readonly edgeGroup = new Group();

  private readonly anchorGroups = new Map<string, Group>();

  private readonly nodeMeshes = new Map<string, Mesh>();

  private readonly interactableMeshes = new Map<string, Mesh>();

  private readonly pickables: Object3D[] = [];

  private readonly playerMesh: Mesh;

  private readonly goalMarker = new Group();

  private container: HTMLElement;

  private webglAvailable = true;

  constructor(container: HTMLElement) {
    this.container = container;
    this.scene = new Scene();
    this.scene.background = new Color('#0b1028');

    this.cameraController = new CameraController();

    this.renderer = this.createRendererSafely();

    container.append(this.renderer.domElement);

    this.scene.add(this.worldGroup);
    this.scene.add(this.edgeGroup);

    const ambient = new AmbientLight('#dfe8ff', 0.8);
    const keyLight = new DirectionalLight('#f5f8ff', 1.1);
    keyLight.position.set(10, 20, 10);
    const rimLight = new DirectionalLight('#7ac8ff', 0.45);
    rimLight.position.set(-14, 12, -8);

    this.scene.add(ambient, keyLight, rimLight);

    this.playerMesh = new Mesh(
      new SphereGeometry(0.23, 20, 20),
      new MeshStandardMaterial({
        color: '#ffe196',
        emissive: '#ffd778',
        emissiveIntensity: 0.32,
        metalness: 0.1,
        roughness: 0.45
      })
    );
    this.playerMesh.position.set(0, 0.4, 0);
    this.scene.add(this.playerMesh);

    this.resize();
  }

  get camera(): OrthographicCamera {
    return this.cameraController.camera;
  }

  get aspect(): number {
    return this.cameraController.getAspect();
  }

  getPickables(): Object3D[] {
    return [...this.pickables];
  }

  resize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.renderer.setSize(width, height, false);
    this.cameraController.resize(width, height);
  }

  applyLevelCamera(level: LevelDef): void {
    this.cameraController.applyLevelCamera(level.camera);
  }

  loadLevel(runtime: LevelRuntimeLike): void {
    this.clearLevelMeshes();

    for (const anchor of runtime.level.anchors) {
      const group = new Group();
      group.name = `anchor-${anchor.id}`;
      this.anchorGroups.set(anchor.id, group);
      this.worldGroup.add(group);
    }

    const nodeGeometry = new CircleGeometry(0.32, 24);
    const nodeMaterial = new MeshStandardMaterial({
      color: '#7fa8ff',
      emissive: '#6f9bff',
      emissiveIntensity: 0.24,
      roughness: 0.4,
      metalness: 0.06
    });
    const nodeRingGeometry = new TorusGeometry(0.34, 0.04, 10, 24);

    for (const node of runtime.level.nodes) {
      const anchorGroup = this.anchorGroups.get(node.anchorId);
      if (!anchorGroup) {
        continue;
      }

      const mesh = new Mesh(nodeGeometry, nodeMaterial.clone());
      mesh.position.set(node.localPosition[0], node.localPosition[1] + 0.08, node.localPosition[2]);
      mesh.rotation.x = -Math.PI / 2;
      mesh.userData.pickKind = 'node';
      mesh.userData.pickId = node.id;

      const ring = new Mesh(
        nodeRingGeometry,
        new MeshStandardMaterial({
          color: '#cfe1ff',
          emissive: '#8cb6ff',
          emissiveIntensity: 0.22,
          roughness: 0.26,
          metalness: 0.14
        })
      );
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.05;
      mesh.add(ring);

      anchorGroup.add(mesh);
      this.nodeMeshes.set(node.id, mesh);
      this.pickables.push(mesh);
    }

    for (const [index, interactable] of runtime.level.interactables.entries()) {
      const anchorGroup = this.anchorGroups.get(interactable.anchorId);
      if (!anchorGroup) {
        continue;
      }

      const baseColor =
        interactable.type === 'rotate'
          ? '#ff9f67'
          : interactable.type === 'slide'
            ? '#66d8aa'
            : '#65c9ff';
      const commonMaterial = new MeshStandardMaterial({
        color: baseColor,
        emissive: '#152b4e',
        emissiveIntensity: 0.48,
        roughness: 0.33,
        metalness: 0.16
      });

      let mesh: Mesh;
      if (interactable.type === 'rotate') {
        mesh = new Mesh(new TorusGeometry(0.28, 0.08, 14, 34), commonMaterial);
        mesh.rotation.x = Math.PI / 2;
      } else if (interactable.type === 'slide') {
        mesh = new Mesh(new BoxGeometry(0.72, 0.2, 0.28), commonMaterial);
      } else {
        mesh = new Mesh(new CylinderGeometry(0.18, 0.2, 0.62, 14), commonMaterial);
      }

      mesh.position.set(0, 0.66 + index * 0.08, 0);
      mesh.userData.pickKind = 'interactable';
      mesh.userData.pickId = interactable.id;
      mesh.userData.baseScale = mesh.scale.clone();

      const label = createLabelSprite(interactable.displayName);
      label.position.set(0, mesh.position.y + 0.45, 0);

      anchorGroup.add(mesh);
      anchorGroup.add(label);
      this.interactableMeshes.set(interactable.id, mesh);
      this.pickables.push(mesh);
    }

    this.applyAnchors(runtime.anchors);
    this.updateGraph(runtime.graph);
    this.updateNodeHighlights(runtime.currentNodeId, runtime.level.goalNodeId);
    this.updateInteractableVisuals(runtime.level, runtime.interactableValues);

    const goalNode = runtime.graph.nodes[runtime.level.goalNodeId];
    this.goalMarker.clear();
    if (goalNode) {
      const ring = new Mesh(
        new TorusGeometry(0.46, 0.08, 12, 32),
        new MeshStandardMaterial({ color: '#f4f6ff', emissive: '#91f2ff', emissiveIntensity: 0.65 })
      );
      ring.rotation.x = Math.PI / 2;
      this.goalMarker.add(ring);
      this.goalMarker.position.set(goalNode.worldPosition[0], goalNode.worldPosition[1] + 0.12, goalNode.worldPosition[2]);
      this.scene.add(this.goalMarker);
    }
  }

  syncRuntime(runtime: LevelRuntimeLike): void {
    this.applyAnchors(runtime.anchors);
    this.updateGraph(runtime.graph);
    this.updateNodeHighlights(runtime.currentNodeId, runtime.level.goalNodeId);
    this.updateInteractableVisuals(runtime.level, runtime.interactableValues);

    const goalNode = runtime.graph.nodes[runtime.level.goalNodeId];
    if (goalNode) {
      this.goalMarker.position.set(goalNode.worldPosition[0], goalNode.worldPosition[1] + 0.12, goalNode.worldPosition[2]);
    }
  }

  setPlayerPosition(position: [number, number, number]): void {
    this.playerMesh.position.set(position[0], position[1] + 0.34, position[2]);
  }

  pulseInteractable(interactableId: string, t: number): void {
    const mesh = this.interactableMeshes.get(interactableId);
    if (!mesh) {
      return;
    }

    const scale = 1 + Math.sin(t * Math.PI) * 0.24;
    mesh.scale.set(scale, scale, scale);
  }

  restoreInteractableScale(interactableId: string): void {
    const mesh = this.interactableMeshes.get(interactableId);
    if (!mesh) {
      return;
    }

    mesh.scale.set(1, 1, 1);
  }

  flashInvalidNode(nodeId: string): void {
    const mesh = this.nodeMeshes.get(nodeId);
    if (!mesh) {
      return;
    }

    const material = mesh.material as MeshStandardMaterial;
    material.emissive.set('#ff3f62');
    material.color.set('#d5507a');
    setTimeout(() => {
      material.emissive.set('#4f75f5');
      material.color.set('#5b7af9');
    }, 220);
  }

  render(): void {
    if (!this.webglAvailable) {
      return;
    }

    this.renderer.render(this.scene, this.camera);
  }

  private clearLevelMeshes(): void {
    this.anchorGroups.clear();
    this.nodeMeshes.clear();
    this.interactableMeshes.clear();
    this.pickables.length = 0;

    this.worldGroup.clear();
    this.edgeGroup.clear();
    this.goalMarker.clear();
    this.scene.remove(this.goalMarker);
  }

  private createRendererSafely(): WebGLRenderer {
    try {
      const renderer = new WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = false;
      return renderer;
    } catch (error) {
      this.webglAvailable = false;
      const canvas = document.createElement('canvas');
      canvas.setAttribute('data-fallback', 'webgl-unavailable');

      console.warn('WebGL unavailable. SceneManager entered fallback mode.', error);

      return {
        domElement: canvas,
        setPixelRatio: () => undefined,
        setSize: () => undefined,
        render: () => undefined,
        shadowMap: { enabled: false }
      } as unknown as WebGLRenderer;
    }
  }

  private applyAnchors(
    anchors: Record<string, { worldPosition: [number, number, number]; worldRotationDeg: [number, number, number] }>
  ): void {
    for (const [anchorId, anchorState] of Object.entries(anchors)) {
      const group = this.anchorGroups.get(anchorId);
      if (!group) {
        continue;
      }

      group.position.set(anchorState.worldPosition[0], anchorState.worldPosition[1], anchorState.worldPosition[2]);
      group.rotation.set(
        (anchorState.worldRotationDeg[0] * Math.PI) / 180,
        (anchorState.worldRotationDeg[1] * Math.PI) / 180,
        (anchorState.worldRotationDeg[2] * Math.PI) / 180
      );
    }
  }

  private updateNodeHighlights(currentNodeId: string, goalNodeId: string): void {
    for (const [nodeId, mesh] of this.nodeMeshes.entries()) {
      const material = mesh.material as MeshStandardMaterial;

      if (nodeId === goalNodeId) {
        material.color.set('#7de7f2');
        material.emissive.set('#7de7f2');
        material.emissiveIntensity = 0.5;
        continue;
      }

      if (nodeId === currentNodeId) {
        material.color.set('#ffe196');
        material.emissive.set('#ffd778');
        material.emissiveIntensity = 0.65;
        continue;
      }

      material.color.set('#5b7af9');
      material.emissive.set('#4f75f5');
      material.emissiveIntensity = 0.18;
    }
  }

  private updateGraph(graph: WalkGraph): void {
    this.edgeGroup.clear();

    const materialForKind = {
      real: new LineBasicMaterial({ color: '#96a8ff' }),
      conditional: new LineBasicMaterial({ color: '#9ff0bf' }),
      illusory: new LineBasicMaterial({ color: '#ffdf9c' })
    };

    const dedupe = new Set<string>();

    for (const [from, edges] of Object.entries(graph.adjacency)) {
      for (const edge of edges) {
        const key = [from, edge.to].sort().join('::') + `::${edge.id}`;
        if (dedupe.has(key)) {
          continue;
        }

        dedupe.add(key);

        const fromNode = graph.nodes[from];
        const toNode = graph.nodes[edge.to];
        if (!fromNode || !toNode) {
          continue;
        }

        const geometry = new BufferGeometry().setFromPoints([
          new Vector3(fromNode.worldPosition[0], fromNode.worldPosition[1] + 0.15, fromNode.worldPosition[2]),
          new Vector3(toNode.worldPosition[0], toNode.worldPosition[1] + 0.15, toNode.worldPosition[2])
        ]);

        const line = new Line(geometry, materialForKind[edge.kind]);
        this.edgeGroup.add(line);
      }
    }
  }

  private updateInteractableVisuals(level: LevelDef, values: Record<string, Scalar>): void {
    for (const interactable of level.interactables) {
      const mesh = this.interactableMeshes.get(interactable.id);
      if (!mesh) {
        continue;
      }

      const value = scalarKey(values[interactable.id]);
      const stateIndex = interactable.states.findIndex((state) => scalarKey(state.value) === value);
      const material = mesh.material as MeshStandardMaterial;

      material.emissiveIntensity = 0.35 + (Math.max(0, stateIndex) % 4) * 0.14;
    }
  }
}
