const { test } = require("node:test");
const assert = require("node:assert/strict");
const mcp = require("../mcp_server.cjs");

test("MCP Server: server instance is configured with metadata and tools", () => {
  assert.ok(mcp.server);
  assert.ok(mcp.activeSolids);
  assert.ok(mcp.assemblyManager);
});

test("MCP Server: registers tools for complete CAD automation", () => {
  const tools = mcp.server._registeredTools || {};
  const toolNames = Object.keys(tools);

  assert.ok(toolNames.includes("cad_get_status"), "has cad_get_status");
  assert.ok(toolNames.includes("cad_create_solid"), "has cad_create_solid");
  assert.ok(toolNames.includes("cad_create_extrusion"), "has cad_create_extrusion");
  assert.ok(toolNames.includes("cad_solve_sketch"), "has cad_solve_sketch");
  assert.ok(toolNames.includes("cad_add_assembly_joint"), "has cad_add_assembly_joint");
  assert.ok(toolNames.includes("cad_export_step"), "has cad_export_step");
  assert.ok(toolNames.includes("cad_export_stl"), "has cad_export_stl");
  assert.ok(toolNames.includes("cad_clear_scene"), "has cad_clear_scene");
});

test("MCP Server: tool execution creates solids and computes sketch constraints", async () => {
  const tools = mcp.server._registeredTools;

  // Clear scene first
  const clearHandler = tools.cad_clear_scene.handler;
  await clearHandler({});
  assert.equal(mcp.activeSolids.length, 0);

  // Create Box Solid
  const createHandler = tools.cad_create_solid.handler;
  const boxRes = await createHandler({
    type: "BOX",
    name: "Base_Plate",
    params: { width: 50, depth: 30, height: 10 },
  });
  assert.ok(boxRes.content[0].text.includes("Base_Plate"));
  assert.equal(mcp.activeSolids.length, 1);

  // Solve Sketch
  const solveHandler = tools.cad_solve_sketch.handler;
  const solveRes = await solveHandler({
    sketch: {
      entities: [
        { id: "p1", kind: "point", x: 0, y: 0 },
        { id: "p2", kind: "point", x: 10, y: 0 },
      ],
      constraints: [{ id: "c1", type: "distance", p1: "p1", p2: "p2", value: 40 }],
    },
  });
  const solveData = JSON.parse(solveRes.content[0].text);
  assert.equal(solveData.converged, true);

  // Add Kinematic Joint
  const jointHandler = tools.cad_add_assembly_joint.handler;
  const jointRes = await jointHandler({
    name: "Hinge_J1",
    type: "revolute",
    bodyA: "Base_Plate",
    bodyB: "Top_Cover",
    axis: [0, 0, 1],
    limits: { min: 0, max: 120 },
  });
  assert.ok(jointRes.content[0].text.includes("Hinge_J1"));
  assert.equal(mcp.assemblyManager.joints.length, 1);
});
