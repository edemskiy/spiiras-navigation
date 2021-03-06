import TRigid from "./TRigid";

// eslint-disable-next-line
const BABYLON = window.BABYLON;

class T3DObject extends TRigid {
  constructor(options) {
    super(options);
    BABYLON.SceneLoader.ImportMesh(
      "",
      "",
      options.src,
      options.scene,
      newMeshes => {
        this.args = options;
        const mesh = newMeshes[0];
        mesh.getObject = () => this;
        mesh.name = options.name + Math.random().toFixed(3) * 1000;
        this.name = mesh.name;
        mesh.checkCollisions = this.collision;
        const size = mesh.getBoundingInfo().boundingBox.extendSize;

        this.height = 2 * size.y;
        this.width = 2 * size.x;
        this.depth = 2 * size.z;

        mesh.position.y += this.height / 2;
        this.addMesh(mesh);
      }
    );
  }

  setPosition(x, y, z) {
    const beginPosition = this.getPosition();
    this.getMesh().position = new BABYLON.Vector3(x, y, z);

    /* WTF BEGIN?? */
    for (let i = 0; i < this.args.scene.meshes.length; i += 1) {
      const tmpMesh = this.args.scene.meshes[i];
      if (tmpMesh.getObject) {
        if (
          tmpMesh.intersectsMesh(this.getMesh()) &&
          tmpMesh.getObject().getClassName() === "TWall"
        ) {
          if (tmpMesh.getObject().isFreeSpace(this)) {
            if (this.getMesh().getContainingWall) {
              this.getMesh()
                .getContainingWall()
                .deleteObject(this, beginPosition);
            }
            this.getMesh().position = tmpMesh
              .getObject()
              .getAddingObjPosition(this.getMesh().position);

            tmpMesh.getObject().addObject(this);
          } else {
            // this.getMesh().position = beginPosition;
          }
          break;
        }
      }
    }
    /* WTF END */
  }

  move(diff, check) {
    if (this.getMesh().getContainingWall) {
      const currentMesh = this.getMesh();
      const containingWall = currentMesh.getContainingWall();
      const alpha = -containingWall.getRotationY();

      if (alpha % Math.PI === 0) {
        if (check.x) currentMesh.position.x += diff.x;
        return;
      }

      if (Math.abs(alpha) === Math.PI / 2) {
        if (check.z) currentMesh.position.z += diff.z;
        return;
      }

      const x1 = currentMesh.position.x + diff.x;
      const z1 = currentMesh.position.z + diff.z;
      const x0 = currentMesh.position.x;
      const z0 = currentMesh.position.z;

      const x =
        (Math.tan(alpha) * (z1 - z0 + x0 * Math.tan(alpha) + x1)) /
        (Math.tan(alpha) ** 2 + 1);

      const z = Math.tan(alpha) * x - (Math.tan(alpha) * x0 + z0);

      currentMesh.position.x = x;
      currentMesh.position.z = z;
    } else {
      super.move(diff, check);
    }
  }
}

export default T3DObject;
