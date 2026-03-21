import { OrthographicCamera } from 'three';
import { GraphBuilder } from '../../src/gameplay/graph/graph-builder';
import { level2 } from '../../src/content/levels/level-2';

describe('GraphBuilder', () => {
  function createCamera(): OrthographicCamera {
    const camera = new OrthographicCamera(-10, 10, 10, -10, 0.1, 200);
    camera.position.set(10, 10, 10);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
    return camera;
  }

  it('activates conditional edges when condition is met', () => {
    const builder = new GraphBuilder();
    const camera = createCamera();
    const stateClosed = { rotatorA: 0 };
    const stateOpen = { rotatorA: 90 };

    const closed = builder.build(level2, stateClosed, camera, 16 / 9);
    const open = builder.build(level2, stateOpen, camera, 16 / 9);

    const closedHasLink = (closed.graph.adjacency.n1 ?? []).some((edge) => edge.to === 'n2');
    const openHasLink = (open.graph.adjacency.n1 ?? []).some((edge) => edge.to === 'n2');

    expect(closedHasLink).toBe(false);
    expect(openHasLink).toBe(true);
  });
});
