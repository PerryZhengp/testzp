import {
  AmbientLight,
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
  Object3D
} from 'three';
import { CameraController } from '../camera/camera-controller';
import type { LevelDef, Scalar, Vec3, WalkGraph } from '../../shared/types/game';
import { scalarKey } from '../../shared/utils/math';

interface LevelRuntimeLike {
  level: LevelDef;
  anchors: Record<string, { worldPosition: [number, number, number]; worldRotationDeg: [number, number, number] }>;
  graph: WalkGraph;
  currentNodeId: string;
  interactableValues: Record<string, Scalar>;
}

interface SceneManagerOptions {
  reserveSideDock?: boolean;
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

  private readonly playerMesh: Group;

  private readonly goalMarker = new Group();

  private container: HTMLElement;

  private webglAvailable = true;

  constructor(container: HTMLElement, options?: SceneManagerOptions) {
    this.container = container;
    this.scene = new Scene();
    this.scene.background = new Color('#d9e8ef');

    this.cameraController = new CameraController();
    this.cameraController.setSideDockReserved(Boolean(options?.reserveSideDock));

    this.renderer = this.createRendererSafely();

    container.append(this.renderer.domElement);

    this.scene.add(this.worldGroup);
    this.scene.add(this.edgeGroup);

    const ambient = new AmbientLight('#f3f7ff', 0.86);
    const keyLight = new DirectionalLight('#fff9ef', 1.05);
    keyLight.position.set(10, 20, 10);
    const rimLight = new DirectionalLight('#8fc3d1', 0.5);
    rimLight.position.set(-14, 12, -8);

    this.scene.add(ambient, keyLight, rimLight);

    this.playerMesh = this.createPlayerAvatar();
    this.playerMesh.position.set(0, 0.11, 0);
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

  applyLevelCamera(level: LevelDef, fitPoints?: Vec3[]): void {
    this.cameraController.applyLevelCamera(level.camera, fitPoints);
  }

  loadLevel(runtime: LevelRuntimeLike): void {
    this.clearLevelMeshes();

    for (const anchor of runtime.level.anchors) {
      const group = new Group();
      group.name = `anchor-${anchor.id}`;
      this.anchorGroups.set(anchor.id, group);
      this.worldGroup.add(group);
    }

    const nodeGeometry = new BoxGeometry(0.58, 0.07, 0.58);
    const nodeTopGeometry = new BoxGeometry(0.31, 0.045, 0.31);
    const nodeMaterial = new MeshStandardMaterial({
      color: '#8ba3ba',
      emissive: '#6e8192',
      emissiveIntensity: 0.18,
      roughness: 0.62,
      metalness: 0.04
    });

    for (const node of runtime.level.nodes) {
      const anchorGroup = this.anchorGroups.get(node.anchorId);
      if (!anchorGroup) {
        continue;
      }

      const mesh = new Mesh(nodeGeometry, nodeMaterial.clone());
      mesh.position.set(node.localPosition[0], node.localPosition[1] + 0.035, node.localPosition[2]);
      mesh.userData.pickKind = 'node';
      mesh.userData.pickId = node.id;

      const topPlate = new Mesh(
        nodeTopGeometry,
        new MeshStandardMaterial({
          color: '#d9ddd8',
          emissive: '#c4cbc3',
          emissiveIntensity: 0.14,
          roughness: 0.7,
          metalness: 0.02
        })
      );
      topPlate.position.y = 0.055;
      mesh.add(topPlate);

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
          ? '#a98a62'
          : interactable.type === 'slide'
            ? '#7e9a96'
            : '#8f9076';
      const commonMaterial = new MeshStandardMaterial({
        color: baseColor,
        emissive: '#45505a',
        emissiveIntensity: 0.24,
        roughness: 0.62,
        metalness: 0.06
      });
      const accentMaterial = new MeshStandardMaterial({
        color: '#ddd6c9',
        emissive: '#b8afa0',
        emissiveIntensity: 0.12,
        roughness: 0.7,
        metalness: 0.02
      });

      let mesh: Mesh;
      if (interactable.type === 'rotate') {
        const bronzeMaterial = new MeshStandardMaterial({
          color: '#8f7053',
          emissive: '#4d3b2a',
          emissiveIntensity: 0.22,
          roughness: 0.42,
          metalness: 0.26
        });
        const brassMaterial = new MeshStandardMaterial({
          color: '#c2a27a',
          emissive: '#7f6649',
          emissiveIntensity: 0.18,
          roughness: 0.36,
          metalness: 0.34
        });
        const ceramicMaterial = new MeshStandardMaterial({
          color: '#e6dfd2',
          emissive: '#b8afa0',
          emissiveIntensity: 0.12,
          roughness: 0.64,
          metalness: 0.04
        });
        const jewelMaterial = new MeshStandardMaterial({
          color: '#85bfbe',
          emissive: '#6ca7a6',
          emissiveIntensity: 0.3,
          roughness: 0.22,
          metalness: 0.16
        });

        mesh = new Mesh(new CylinderGeometry(0.13, 0.16, 0.22, 18), bronzeMaterial);

        const footing = new Mesh(new CylinderGeometry(0.19, 0.19, 0.06, 24), commonMaterial);
        footing.position.y = -0.12;
        const crownRing = new Mesh(new TorusGeometry(0.145, 0.022, 12, 28), brassMaterial);
        crownRing.rotation.x = Math.PI / 2;
        crownRing.position.y = 0.06;
        const topDisk = new Mesh(new CylinderGeometry(0.112, 0.124, 0.065, 24), ceramicMaterial);
        topDisk.position.y = 0.11;
        const handleHub = new Mesh(new CylinderGeometry(0.045, 0.045, 0.07, 16), brassMaterial);
        handleHub.position.y = 0.165;
        const handleA = new Mesh(new BoxGeometry(0.33, 0.045, 0.085), ceramicMaterial);
        handleA.position.y = 0.195;
        const handleB = new Mesh(new BoxGeometry(0.085, 0.045, 0.33), ceramicMaterial);
        handleB.position.y = 0.195;
        const jewel = new Mesh(new SphereGeometry(0.03, 14, 14), jewelMaterial);
        jewel.position.y = 0.245;

        mesh.add(footing, crownRing, topDisk, handleHub, handleA, handleB, jewel);
      } else if (interactable.type === 'slide') {
        mesh = new Mesh(new BoxGeometry(0.64, 0.085, 0.19), commonMaterial);
        const slider = new Mesh(new BoxGeometry(0.15, 0.14, 0.15), accentMaterial);
        slider.position.set(0.16, 0.12, 0);
        mesh.add(slider);
      } else {
        mesh = new Mesh(new BoxGeometry(0.42, 0.2, 0.42), commonMaterial);
        const cap = new Mesh(new BoxGeometry(0.24, 0.065, 0.24), accentMaterial);
        cap.position.y = 0.145;
        mesh.add(cap);
      }

      mesh.position.set(0, 0.5 + index * 0.07, 0);
      mesh.userData.pickKind = 'interactable';
      mesh.userData.pickId = interactable.id;
      mesh.userData.baseScale = mesh.scale.clone();

      anchorGroup.add(mesh);
      this.interactableMeshes.set(interactable.id, mesh);
      this.pickables.push(mesh);
    }

    this.applyAnchors(runtime.anchors);
    this.updateGraph(runtime.graph);
    this.updateNodeHighlights(runtime.currentNodeId, runtime.level.goalNodeId, runtime.graph);
    this.updateInteractableVisuals(runtime.level, runtime.interactableValues);

    const goalNode = runtime.graph.nodes[runtime.level.goalNodeId];
    this.goalMarker.clear();
    if (goalNode) {
      const outer = new Mesh(
        new BoxGeometry(0.72, 0.07, 0.72),
        new MeshStandardMaterial({ color: '#d0b788', emissive: '#ae9362', emissiveIntensity: 0.24 })
      );
      const inner = new Mesh(
        new BoxGeometry(0.4, 0.045, 0.4),
        new MeshStandardMaterial({ color: '#ece7d8', emissive: '#cbc3b1', emissiveIntensity: 0.12 })
      );
      inner.position.y = 0.055;
      this.goalMarker.add(outer, inner);
      this.goalMarker.position.set(goalNode.worldPosition[0], goalNode.worldPosition[1] + 0.05, goalNode.worldPosition[2]);
      this.scene.add(this.goalMarker);
    }
  }

  syncRuntime(runtime: LevelRuntimeLike): void {
    this.applyAnchors(runtime.anchors);
    this.updateGraph(runtime.graph);
    this.updateNodeHighlights(runtime.currentNodeId, runtime.level.goalNodeId, runtime.graph);
    this.updateInteractableVisuals(runtime.level, runtime.interactableValues);

    const goalNode = runtime.graph.nodes[runtime.level.goalNodeId];
    if (goalNode) {
      this.goalMarker.position.set(goalNode.worldPosition[0], goalNode.worldPosition[1] + 0.05, goalNode.worldPosition[2]);
    }
  }

  setPlayerPosition(position: [number, number, number]): void {
    this.playerMesh.position.set(position[0], position[1] + 0.11, position[2]);
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
    material.emissive.set('#d96f66');
    material.color.set('#cf8066');
    setTimeout(() => {
      material.emissive.set('#6e8192');
      material.color.set('#8ba3ba');
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

  private updateNodeHighlights(currentNodeId: string, goalNodeId: string, graph: WalkGraph): void {
    const directReachable = new Set((graph.adjacency[currentNodeId] ?? []).map((edge) => edge.to));

    for (const [nodeId, mesh] of this.nodeMeshes.entries()) {
      const material = mesh.material as MeshStandardMaterial;

      if (nodeId === goalNodeId) {
        material.color.set('#d0b788');
        material.emissive.set('#ae9362');
        material.emissiveIntensity = 0.28;
        continue;
      }

      if (nodeId === currentNodeId) {
        material.color.set('#d7d0bf');
        material.emissive.set('#b5ac97');
        material.emissiveIntensity = 0.3;
        continue;
      }

      if (directReachable.has(nodeId)) {
        material.color.set('#9cad97');
        material.emissive.set('#7f8f7b');
        material.emissiveIntensity = 0.22;
        continue;
      }

      material.color.set('#8ba3ba');
      material.emissive.set('#6e8192');
      material.emissiveIntensity = 0.12;
    }
  }

  private updateGraph(graph: WalkGraph): void {
    this.edgeGroup.clear();

    const materialForKind = {
      real: new MeshStandardMaterial({
        color: '#9baab5',
        emissive: '#7a858d',
        emissiveIntensity: 0.08,
        roughness: 0.72,
        metalness: 0.02
      }),
      conditional: new MeshStandardMaterial({
        color: '#97a997',
        emissive: '#748373',
        emissiveIntensity: 0.1,
        roughness: 0.7,
        metalness: 0.02
      }),
      illusory: new MeshStandardMaterial({
        color: '#bea174',
        emissive: '#967d57',
        emissiveIntensity: 0.14,
        roughness: 0.68,
        metalness: 0.03
      })
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

        const fromPos = new Vector3(
          fromNode.worldPosition[0],
          fromNode.worldPosition[1] + 0.02,
          fromNode.worldPosition[2]
        );
        const toPos = new Vector3(
          toNode.worldPosition[0],
          toNode.worldPosition[1] + 0.02,
          toNode.worldPosition[2]
        );

        const length = fromPos.distanceTo(toPos);
        if (length < 0.001) {
          continue;
        }

        const bridge = new Mesh(new BoxGeometry(0.16, 0.042, length), materialForKind[edge.kind]);
        bridge.position.copy(fromPos).add(toPos).multiplyScalar(0.5);
        bridge.lookAt(toPos);
        this.edgeGroup.add(bridge);
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

      material.emissiveIntensity = 0.24 + (Math.max(0, stateIndex) % 4) * 0.11;
    }
  }

  private createPlayerAvatar(): Group {
    const root = new Group();
    root.name = 'player-avatar';

    const robeMaterial = new MeshStandardMaterial({
      color: '#f4f4ef',
      emissive: '#dbdbd1',
      emissiveIntensity: 0.14,
      roughness: 0.68,
      metalness: 0.02
    });
    const trimMaterial = new MeshStandardMaterial({
      color: '#2f4859',
      emissive: '#253a48',
      emissiveIntensity: 0.1,
      roughness: 0.56,
      metalness: 0.04
    });
    const skinMaterial = new MeshStandardMaterial({
      color: '#f1dac2',
      emissive: '#d8c0a8',
      emissiveIntensity: 0.08,
      roughness: 0.72,
      metalness: 0
    });
    const accentMaterial = new MeshStandardMaterial({
      color: '#f0a15f',
      emissive: '#dc8f51',
      emissiveIntensity: 0.2,
      roughness: 0.6,
      metalness: 0.02
    });
    const eyeMaterial = new MeshStandardMaterial({
      color: '#f8fbff',
      emissive: '#f8fbff',
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0
    });

    const base = new Mesh(new CylinderGeometry(0.085, 0.1, 0.03, 20), accentMaterial);
    base.position.y = 0.015;
    const robe = new Mesh(new ConeGeometry(0.1, 0.24, 18), robeMaterial);
    robe.position.y = 0.14;
    const robeBand = new Mesh(new CylinderGeometry(0.08, 0.08, 0.025, 18), trimMaterial);
    robeBand.position.y = 0.05;

    const head = new Mesh(new SphereGeometry(0.05, 20, 20), skinMaterial);
    head.position.set(0, 0.285, 0);

    const hood = new Mesh(new ConeGeometry(0.075, 0.15, 16), trimMaterial);
    hood.position.set(0.008, 0.37, 0.012);
    hood.rotation.z = 0.38;
    hood.rotation.x = -0.18;

    const eye = new Mesh(new SphereGeometry(0.015, 12, 12), eyeMaterial);
    eye.position.set(0.035, 0.365, 0.06);

    root.add(base, robe, robeBand, head, hood, eye);
    return root;
  }
}
