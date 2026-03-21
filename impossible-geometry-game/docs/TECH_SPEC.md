# 技术规格与闭环设计

本文件定义了该原创解谜游戏在技术实现和流程设计上的硬性约束与建议，确保游戏逻辑自洽、状态可验证、内容可扩展。它补充了 `PRD.md` 中的需求，并重点说明如何闭环实现产品、失败、技术和内容四个维度。

## 一、四个闭环

### 1. 产品闭环

游戏的高层流程必须形成完整闭环，避免玩家流失。

```
启动 → 读档 → 主菜单 → 选关 → 加载关卡 → 观察 → 交互 → 路径重算 → 角色移动 → 到达终点 → 结算 → 解锁下一关 → 存档 → 回到选关/进入下一关
```

任何时刻玩家都能清楚自己所处的位置，并能继续前进或返回主菜单。

### 2. 失败闭环

在本游戏中“失败”不代表死亡或结束，而是暂时无法形成通路。循环如下：

```
误操作/暂时走不通 → 玩家继续观察 → 若停滞过久则给弱提示 → 再尝试 → 若仍卡住则一键重置 → 回到本关初始状态
```

重要的是禁止出现无路可走但也看不到原因的局面；每次重置都必须恢复初始可解状态。

### 3. 技术闭环

从数据到渲染的每一步都要形成链路：

```
LevelDef → SceneLoader → GraphBuilder → Input → Interaction → GraphRebuild → Pathfinding → CompletionCheck → SaveService
```

所有逻辑真值只能来源于可行走图（Walk Graph），渲染层（Scene Graph）只是视觉表现。机关状态变化必须经过 GraphRebuild 才影响寻路和完成判定。

### 4. 内容闭环

关卡设计流程必须自检：

```
设计关卡 → 运行校验器 → 修正 → 试玩 → 确认可解 → 入库
```

未经验证不可放入正式游戏。校验器需要检查唯一标识、引用完整性、初始可达、终点存在、解法存在以及没有让玩家站立节点失效的机关组合等。

## 二、非可商量的硬约束

1. **固定正交摄像机**：禁止玩家自由旋转或拖拽视角。错视谜题必须建立在受控视角下。
2. **行走图是真值源**：角色是否可走只能由 `GraphSystem` 决定，禁止使用 mesh 碰撞或物理引擎推断可达性。
3. **有限离散机关状态**：所有机关都采用有限离散值（如 0/90/180/270 或 left/right）。禁止使用连续值作为谜题真值，否则校验复杂。
4. **状态变化必重算行走图**：顺序为：点击→播放动画→更新状态→重算图→允许下一次输入。
5. **输入序列化**：在 `Moving` 或 `Interacting` 状态期间锁定输入，除暂停外不可执行其他操作，避免竞争条件。
6. **禁止玩家站立节点失效**：不允许机关操作删除当前玩家所在节点或使其不可达；可以通过引擎层防护或校验器预防。
7. **不持久化关内瞬时状态**：首版仅保存关外进度（解锁/完成关卡及设置项），刷新后从关卡初始状态重新开始。
8. **谜题逻辑无随机性**：所有初始状态和目标都是确定性的；禁止随机生成道路或目标位置，以便验证和复现。

## 三、完整的玩法循环

在关卡内，玩家的操作循环为：

```
观察 → 规划 → 点击机关 → 播放动画 → 世界变化 → 重算路径 → 点击目标节点 → 角色移动 → 到达新位置 → 再次观察
```

每轮循环不应过长（约 10–30 秒）且必须有明确反馈：点击交互物时高亮并播放动画；点击可达节点时角色移动；点击不可达节点时给予轻反馈；达到终点时播放完成反馈；卡顿时提示。

失败不意味着生命值清零或重开游戏，而是说明当前路线尚未打通；玩家可以继续尝试或重置。

## 四、MVP 边界

**必做**：主菜单、选关、关卡加载、固定镜头游玩、点击移动、三种机关 + 透视路径、关卡完成结算、解锁链、本地存档、暂停/重置/返回、设置、弱提示。

**首版机关**：旋转塔楼、滑动桥梁、升降立柱、透视对齐。不做传送门、光束折射、敌人、多人模式等。

**不做**：自由摄像机、物理系统、战斗、随机生成、在线存档、关卡编辑器、程序化生成。

## 五、状态机设计

将全局状态与游玩子状态分离，以序列化输入。示例：

```ts
type AppState =
  | 'boot'
  | 'mainMenu'
  | 'levelSelect'
  | 'loadingLevel'
  | 'playing'
  | 'paused'
  | 'completing'
  | 'settings';

type PlayState = 'idle' | 'moving' | 'interacting' | 'transitioning';
```

规则：

- 在 `idle` 状态下可点击节点或机关。
- 在 `moving` 或 `interacting` 状态下仅允许暂停，不接受其他输入。
- 在 `transitioning`（镜头过渡或完成结算）状态下不接受任何游戏内输入。
- `paused` 状态只接受 UI 输入。

## 六、数据结构建议

避免把逻辑写成字符串表达式，使用结构化条件。建议接口：

```ts
type Scalar = string | number | boolean;

interface ConditionAtom {
  ref: string;
  eq: Scalar;
}

interface ConditionDef {
  all?: ConditionAtom[];
  any?: ConditionAtom[];
  not?: ConditionAtom[];
}

interface NodeDef {
  id: string;
  anchorId: string;
  localPosition: [number, number, number];
}

interface EdgeDef {
  id: string;
  from: string;
  to: string;
  kind: 'real' | 'conditional' | 'illusory';
  bidirectional?: boolean;
  when?: ConditionDef;
  thresholdNdc?: number;
}

interface InteractableStateDef {
  value: Scalar;
  durationMs: number;
}

interface InteractableDef {
  id: string;
  type: 'rotate' | 'slide' | 'lift';
  remote: boolean;
  initialValue: Scalar;
  states: InteractableStateDef[];
  anchorId: string;
}

interface CameraDef {
  zoom: number;
  yawDeg: number;
  pitchDeg: number;
}

interface LevelDef {
  id: string;
  title: string;
  chapterId: string;
  spawnNodeId: string;
  goalNodeId: string;
  camera: CameraDef;
  nodes: NodeDef[];
  edges: EdgeDef[];
  interactables: InteractableDef[];
}
```

## 七、场景图与行走图分离

**Scene Graph** 负责渲染：模型、光照、特效、相机。

**Walk Graph** 负责逻辑：节点、边、机关状态和错视连接，是角色寻路的唯一依据。

桥接两者的关键是 **Anchor/Transform** 概念：可移动的建筑块拥有一个 `anchor`；节点附着在 anchor 下的局部坐标。机关操作改变 anchor 的变换，`GraphSystem` 每次重算时从 anchor 读取世界坐标，构建行走图。这样确保视觉与逻辑在同一空间基准下运行，避免出现“看似连上了但走不过去”的情况。

## 八、错视连边实现细则

为了避免误连和分辨率依赖，实施如下规则：

1. 每条 `illusory` 边明确指定 `from` 和 `to` 节点，系统只检查这些 pair，不自动连任意临近节点。
2. 每次重算行走图时，将两个节点的世界坐标投影到标准化设备坐标（NDC），计算 2D 距离。
3. 若投影距离小于该边的 `thresholdNdc`，且其他条件通过，则激活该边；否则该边无效。
4. 使用固定的逻辑安全视窗（如 16∶9 内嵌窗口）进行计算，以抵消屏幕长宽比对 NDC 距离的影响。

阈值推荐 0.015–0.03（根据实际关卡调整）。

## 九、输入系统

- 使用 Pointer Events 统一鼠标和触屏。
- 命中代理：不要直接射线检测复杂的三角面；节点使用隐形球体或胶囊体，机关使用隐形盒子。
- 桌面端允许 hover 高亮；触屏只处理 tap，不引入双击语义。
- Canvas 区域禁用浏览器默认滚动和上下文菜单，以免影响体验。

## 十、移动系统

- 仅支持点击目标节点，由 A* 寻路产生节点序列，角色沿节点序列插值移动。
- 角色移动速度统一；到达节点时更新朝向；楼梯通过更密集的节点实现上下高度变化。
- 点击不可达目标不弹错误提示，而是给予抖动或音效，提示“不可达”。

## 十一、关卡设计闭环

每关必须经历 “展示 → 教学 → 组合 → 回报” 四步，确保学习曲线平滑并包含惊喜点；早期关卡最多涉及 2 个机制，后期最多 3 个。

## 十二、存档策略

使用如下接口保存元进度：

```ts
interface SaveDataV1 {
  version: 1;
  unlockedLevelIds: string[];
  completedLevelIds: string[];
  lastPlayedLevelId?: string;
  settings: {
    language: 'zh-CN' | 'en';
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    reducedMotion: boolean;
  };
}
```

存档写入时机：完成关卡后、修改设置后、返回主菜单时。读取时机：启动游戏时。首版不保存关内机关状态或玩家位置。

## 十三、关卡校验器

建议在 `tools/validate-levels.ts` 中实现一个校验脚本，至少检查以下内容：

1. 所有 ID 唯一，引用的节点和锚点存在。
2. 玩家出生点和终点存在且初始可达。
3. 所有机关引用的锚点存在，并且状态定义完整。
4. 通过 BFS/DFS 遍历 `(playerNodeId, interactableStates[])` 的组合验证存在解。
5. 任意机关操作后，玩家站立节点仍然有效。
6. Reset 功能能够返回初始状态。

此脚本可大幅提高关卡迭代效率，避免发布无解或存在死局的关卡。

## 十四、测试要求

### 单元测试

对以下模块进行单元测试：

- `ConditionEvaluator`：条件表达式解析与判定。
- `GraphBuilder`：根据关卡数据正确构建行走图。
- `IllusoryEdgeResolver`：根据投影距离激活或禁用错视边。
- `AStarPathfinder`：在当前图上找到最短路径。
- `SaveService`：读写存档并向前兼容版本。

### 集成测试

测试机关与图更新是否联动：

- 旋转塔后路径正确变化。
- 滑动桥后可达节点更新。
- 完成关卡后自动解锁下一关。
- 重置后场景和行走图恢复初始值。

### 端到端（E2E）

使用 Playwright 等工具录制三条核心路径：

1. 启动 → 选关 → 完成第一关 → 刷新页面 → 进度仍在。
2. 进入关卡 → 随意操作导致无路 → 重置 → 能继续游玩。
3. 打开设置并启用 `reducedMotion` → 进入关卡 → 动画时间减短但逻辑不变。

## 十五、目录结构回顾

项目结构应与 `PRD.md` 中一致，例如：

```
impossible-geometry-game/
  docs/
    PRD.md
    TECH_SPEC.md
  src/
    app/
      bootstrap/
      state/
      screens/
    engine/
      render/
      camera/
      input/
      animation/
      audio/
    gameplay/
      graph/
      pathfinding/
      interaction/
      movement/
      level/
      validation/
    content/
      levels/
      chapters/
    ui/
      overlay/
      menu/
      settings/
    services/
      save/
    shared/
      types/
      utils/
  tools/
    validate-levels.ts
  tests/
    unit/
    integration/
    e2e/
  README.md
```

## 十六、开发顺序

为保持条理，建议按阶段实施：

1. **Phase 1：骨架** – 搭建 Vite + TypeScript 项目，引入 Three.js，构建全局状态机和基础场景；渲染循环和 UI 蒙版。
2. **Phase 2：玩法真值层** – 定义 `LevelDef` 及其相关接口，实现 `LevelLoader`、`GraphBuilder`、A* 寻路和点击移动。
3. **Phase 3：机关系统** – 实现旋转、滑动和升降机关，使用离散状态驱动动画；每次状态改变后重算行走图；实现重置功能。
4. **Phase 4：错视系统** – 实现 NDC 对齐计算、阈值判断以及调试可视化；保证仅检查授权的节点 pair。
5. **Phase 5：流程闭环** – 实现关卡完成、解锁链、本地存档、设置、暂停/重置/返回和提示系统。
6. **Phase 6：内容与验证** – 制作样板关卡，开发验证脚本，编写单元与集成测试，完善 UI，并扩展到 8 个正式关卡。

## 十七、提示词参考

为帮助生成式代码工具高效执行，可以按以下提示顺序喂入：

1. 项目骨架：创建 TypeScript + Vite 项目，建立目录结构、状态机和基本渲染循环。
2. 关卡系统与移动：定义 `LevelDef`、节点/边/机关结构，实现关卡加载和点击移动。
3. 机关系统：添加旋转、滑动、升降机关，确保离散状态和图重建。
4. 错视连边：实现 NDC 对齐计算、阈值激活和调试功能。
5. 流程闭环：实现完成判定、解锁链、存档和设置页面；添加弱提示系统。
6. 校验器与测试：编写 `validate-levels.ts` 脚本和单元/集成/E2E 测试；制作 3 个示例关卡。

## 十八、总结 – 总约束

为保证游戏逻辑自洽，下列规则不可违反：

- 固定正交摄像机；玩家不能自由旋转。
- 场景图只是视觉表现；行走图是唯一的玩法真值。
- 所有机关使用离散可序列化状态，不使用连续值。
- 每次状态变化后必须重算行走图；逻辑与动画同步。
- 输入必须根据游玩状态机串行化；移动和交互过程禁用其他输入。
- 不允许随机谜题逻辑；关卡初始状态确定且可重复。
- 重置功能必须恢复关卡初始状态，消除死局。
- 存档仅保存元进度和设置，首版不保存关内状态。
- 每个关卡必须经过验证器确认存在解决方案，且任何机关组合不会使玩家站立节点失效。

这些约束和指引为项目提供了可验证的技术基础，也为未来扩展留出了空间。