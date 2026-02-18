import * as THREE from "three";
import { SimSnapshot } from "../sim/SimTypes";
import { ThreeCamera } from "./ThreeCamera";
import { PlayerView } from "./views/PlayerView";
import { DangerView } from "./views/DangerView";
import { WorldView } from "./views/WorldView";

export class ThreeApp {
  private readonly scene: THREE.Scene;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly cameraRig: ThreeCamera;
  private readonly playerView: PlayerView;
  private readonly dangerView: DangerView;
  private readonly worldView: WorldView;
  private readonly worldScale = 0.08;
  private destroyed = false;

  private readonly onResize = () => {
    this.resize();
  };

  public constructor(private readonly parent: HTMLElement, initialSnapshot: SimSnapshot) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x06111d);
    this.scene.fog = new THREE.Fog(0x081724, 85, 280);

    const aspect = Math.max(1, this.parent.clientWidth) / Math.max(1, this.parent.clientHeight);
    this.cameraRig = new ThreeCamera(aspect);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    this.renderer.domElement.style.position = "absolute";
    this.renderer.domElement.style.left = "0";
    this.renderer.domElement.style.top = "0";
    this.renderer.domElement.style.width = "100%";
    this.renderer.domElement.style.height = "100%";
    this.renderer.domElement.style.pointerEvents = "none";
    this.renderer.domElement.style.zIndex = "0";

    this.ensureParentLayering();
    this.parent.prepend(this.renderer.domElement);

    const amb = new THREE.AmbientLight(0xa8c6dd, 0.65);
    const dir = new THREE.DirectionalLight(0xd7ebff, 1.1);
    dir.position.set(40, 90, 30);
    this.scene.add(amb);
    this.scene.add(dir);

    this.worldView = new WorldView(initialSnapshot, this.worldScale);
    this.playerView = new PlayerView(this.worldScale);
    this.dangerView = new DangerView();

    this.scene.add(this.worldView.root);
    this.scene.add(this.playerView.root);
    this.scene.add(this.dangerView.root);

    this.resize();
    window.addEventListener("resize", this.onResize);
  }

  public update(snapshot: SimSnapshot, dtSec: number): void {
    if (this.destroyed) {
      return;
    }

    this.playerView.update(snapshot, this.worldScale);
    this.dangerView.update(snapshot, this.worldScale);
    this.worldView.update(snapshot);

    this.cameraRig.updateFollow(snapshot.player.x * this.worldScale, snapshot.player.y * this.worldScale, dtSec);
    this.renderer.render(this.scene, this.cameraRig.camera);
  }

  public destroy(): void {
    if (this.destroyed) {
      return;
    }

    this.destroyed = true;
    window.removeEventListener("resize", this.onResize);

    this.playerView.dispose();
    this.dangerView.dispose();
    this.worldView.dispose();

    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }

  private resize(): void {
    const width = Math.max(1, this.parent.clientWidth);
    const height = Math.max(1, this.parent.clientHeight);
    this.renderer.setSize(width, height, false);
    this.cameraRig.resize(width / height);
  }

  private ensureParentLayering(): void {
    const style = window.getComputedStyle(this.parent);
    if (style.position === "static") {
      this.parent.style.position = "relative";
    }
  }
}
