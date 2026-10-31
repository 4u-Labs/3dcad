#!/usr/bin/env node
/**
 * 3DCad Studio — Model Context Protocol (MCP) Server
 * Real automation endpoint for AI agents (Claude, Antigravity, Cursor, Codex).
 * Exposes full 3D CAD modeling, 2D sketch constraint solving, BRep operations,
 * and STEP/STL exports via Stdio transport.
 */
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");
const fs = require("node:fs");
const path = require("node:path");

const CadSketchSolver = require("./cad_sketch_solver.js");
const CadProject = require("./cad_project.js");
const CadMesh = require("./cad_mesh.js");
const CadGenerators = require("./cad_generators.js");
const CadAssembly = require("./cad_assembly.js");

// In-memory CAD state managed by this MCP session
let activeSolids = [];
let activeFeatures = [];
let assemblyManager = new CadAssembly.AssemblyManager();

const server = new McpServer({
  name: "3dcad-studio",
  version: "1.3.0",
  description: "Parametric 3D CAD & BRep Modeling Server for 3DCad Studio",
});

// Resource: cad://project/json
server.resource("project-json", "cad://project/json", async () => {
  const doc = CadProject.document(activeSolids);
  return {
    contents: [
      {
        uri: "cad://project/json",
        mimeType: "application/json",
        text: JSON.stringify(doc, null, 2),
      },
    ],
  };
});

// Resource: cad://project/summary
server.resource("project-summary", "cad://project/summary", async () => {
  const summary = {
    unit: "mm",
    coordinateSystem: "Z-up",
    solidsCount: activeSolids.length,
    featuresCount: activeFeatures.length,
    jointsCount: assemblyManager.joints.length,
    solids: activeSolids.map((s) => ({
      id: s.id,
      name: s.name,
      type: s.type,
      pos: s.pos,
      rot: s.rot,
      params: s.params,
    })),
  };
  return {
    contents: [
      {
        uri: "cad://project/summary",
        mimeType: "text/plain",
        text: JSON.stringify(summary, null, 2),
      },
    ],
  };
});

// Tool 1: cad_get_status
server.tool(
  "cad_get_status",
  "Get the current CAD workspace status, active parts, units, and scene bounding boxes",
  {},
  async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              status: "ready",
              units: "mm",
              partsCount: activeSolids.length,
              featuresCount: activeFeatures.length,
              jointsCount: assemblyManager.joints.length,
              parts: activeSolids.map((p) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                params: p.params,
                pos: p.pos,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool 2: cad_create_solid
server.tool(
  "cad_create_solid",
  "Create a parametric 3D solid (BOX, CYLINDER, SPHERE, CONE, TORUS, SPUR_GEAR, L_BRACKET, ENCLOSURE, MOUNTING_PLATE, HEX_BOLT, PULLEY, PILLOW_BLOCK, SNAP_LID_BOX)",
  {
    type: z.enum([
      "BOX",
      "CYLINDER",
      "SPHERE",
      "CONE",
      "TORUS",
      "SPUR_GEAR",
      "L_BRACKET",
      "ENCLOSURE",
      "MOUNTING_PLATE",
      "HEX_BOLT",
      "PULLEY",
      "PILLOW_BLOCK",
      "SNAP_LID_BOX",
    ]),
    name: z.string().optional(),
    color: z.string().optional(),
    pos: z.array(z.number()).length(3).optional(),
    rot: z.array(z.number()).length(3).optional(),
    params: z.record(z.any()).optional(),
  },
  async ({ type, name, color, pos = [0, 0, 0], rot = [0, 0, 0], params = {} }) => {
    const validParams = CadProject.validateParams(type, params);
    const id = `solid_${activeSolids.length + 1}`;
    const partName = name || `${type}_${activeSolids.length + 1}`;
    const solidRecord = {
      id,
      type,
      name: partName,
      color: color || "#f97316",
      params: validParams,
      pos,
      rot,
      scale: [1, 1, 1],
      visible: true,
    };
    activeSolids.push(solidRecord);
    activeFeatures.push({ id, type, params: validParams, name: partName });
    return {
      content: [
        {
          type: "text",
          text: `Solid "${partName}" (${type}) created at pos [${pos.join(", ")}]. Active solids: ${activeSolids.length}.`,
        },
      ],
    };
  }
);

// Tool 3: cad_create_extrusion
server.tool(
  "cad_create_extrusion",
  "Extrude a 2D sketch profile into a 3D solid",
  {
    name: z.string().optional(),
    height: z.number().min(0.5).max(400),
    bevel: z.number().min(0).max(10).optional(),
    entities: z.array(
      z.object({
        kind: z.enum(["rect", "circle", "slot", "polygon"]),
        x: z.number(),
        y: z.number(),
        w: z.number().optional(),
        h: z.number().optional(),
        r: z.number().optional(),
        sides: z.number().optional(),
        isHole: z.boolean().optional(),
      })
    ),
  },
  async ({ name, height, bevel = 0, entities }) => {
    const params = CadProject.validateParams("SKETCH_EXTRUDE", { height, bevel, entities });
    const id = `solid_${activeSolids.length + 1}`;
    const partName = name || `Extrude_${activeSolids.length + 1}`;
    const record = {
      id,
      type: "SKETCH_EXTRUDE",
      name: partName,
      color: "#f97316",
      params,
      pos: [0, 0, 0],
      rot: [0, 0, 0],
      scale: [1, 1, 1],
      visible: true,
    };
    activeSolids.push(record);
    activeFeatures.push({ id, type: "EXTRUDE", params, name: partName });
    return {
      content: [
        {
          type: "text",
          text: `Extruded solid "${partName}" (Z = ${height} mm, ${entities.length} profile entities) created.`,
        },
      ],
    };
  }
);

// Tool 4: cad_solve_sketch
server.tool(
  "cad_solve_sketch",
  "Solve a 2D sketch with geometric and dimensional constraints (coincident, horizontal, vertical, distance, tangent, etc.) and calculate degrees of freedom (DOF)",
  {
    sketch: z.object({
      entities: z.array(z.record(z.any())),
      constraints: z.array(z.record(z.any())).optional(),
    }),
  },
  async ({ sketch }) => {
    const result = CadSketchSolver.solveSketch(sketch);
    const profiles = CadSketchSolver.extractProfiles(result.sketch);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              converged: result.converged,
              status: result.status,
              dof: result.dof,
              equations: result.equations,
              variables: result.variables,
              maxError: result.maxError,
              profilesCount: profiles.length,
              solvedEntities: result.sketch.entities,
            },
            null,
            2
          ),
        },
      ],
    };
  }
);

// Tool 5: cad_add_assembly_joint
server.tool(
  "cad_add_assembly_joint",
  "Add a kinematic joint between two bodies (fixed, revolute, slider, ball)",
  {
    type: z.enum(["fixed", "revolute", "slider", "ball"]),
    name: z.string().optional(),
    bodyA: z.string(),
    bodyB: z.string(),
    anchor: z.array(z.number()).length(3).optional(),
    axis: z.array(z.number()).length(3).optional(),
    limits: z
      .object({
        min: z.number(),
        max: z.number(),
        enabled: z.boolean().optional(),
      })
      .optional(),
    value: z.number().optional(),
  },
  async (config) => {
    const joint = assemblyManager.addJoint(config);
    return {
      content: [
        {
          type: "text",
          text: `Joint "${joint.name}" (${joint.type}) connecting "${joint.bodyA}" to "${joint.bodyB}" created.`,
        },
      ],
    };
  }
);

// Tool 6: cad_export_step
server.tool(
  "cad_export_step",
  "Export the current model to a STEP file on disk",
  {
    filepath: z.string(),
  },
  async ({ filepath }) => {
    if (!activeSolids.length) {
      throw new Error("Scene is empty, cannot export STEP");
    }
    const resolvedPath = path.resolve(filepath);
    const threeMeshes = activeSolids.map((item) => {
      const g = CadProject.geometry(item);
      const m = {
        geometry: g,
        position: { toArray: () => item.pos, x: item.pos[0], y: item.pos[1], z: item.pos[2] },
        rotation: { x: item.rot[0], y: item.rot[1], z: item.rot[2] },
        scale: { toArray: () => [1, 1, 1], x: 1, y: 1, z: 1 },
        matrixWorld: { determinant: () => 1 },
        updateWorldMatrix: () => {},
        visible: true,
        userData: { name: item.name, color: item.color },
      };
      return m;
    });

    const stepBlob = CadMesh.step(threeMeshes);
    const buffer = Buffer.from(await stepBlob.arrayBuffer());
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, buffer);
    return {
      content: [
        {
          type: "text",
          text: `STEP exported to ${resolvedPath} (${buffer.length} bytes).`,
        },
      ],
    };
  }
);

// Tool 7: cad_export_stl
server.tool(
  "cad_export_stl",
  "Export the current model to a binary STL file on disk",
  {
    filepath: z.string(),
  },
  async ({ filepath }) => {
    if (!activeSolids.length) {
      throw new Error("Scene is empty, cannot export STL");
    }
    const resolvedPath = path.resolve(filepath);
    const threeMeshes = activeSolids.map((item) => {
      const g = CadProject.geometry(item);
      const m = {
        geometry: g,
        position: { toArray: () => item.pos, x: item.pos[0], y: item.pos[1], z: item.pos[2] },
        rotation: { x: item.rot[0], y: item.rot[1], z: item.rot[2] },
        scale: { toArray: () => [1, 1, 1], x: 1, y: 1, z: 1 },
        matrixWorld: { determinant: () => 1 },
        updateWorldMatrix: () => {},
        visible: true,
        userData: { name: item.name, color: item.color },
      };
      return m;
    });

    const stlBlob = CadMesh.stl(threeMeshes);
    const buffer = Buffer.from(await stlBlob.arrayBuffer());
    fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    fs.writeFileSync(resolvedPath, buffer);
    return {
      content: [
        {
          type: "text",
          text: `Binary STL exported to ${resolvedPath} (${buffer.length} bytes).`,
        },
      ],
    };
  }
);

// Tool 8: cad_clear_scene
server.tool("cad_clear_scene", "Clear all parts and features from the workspace", {}, async () => {
  const count = activeSolids.length;
  activeSolids.length = 0;
  activeFeatures.length = 0;
  assemblyManager.joints.length = 0;
  assemblyManager.bodies.clear();
  return {
    content: [
      {
        type: "text",
        text: `Workspace cleared. Removed ${count} parts.`,
      },
    ],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[3DCad MCP Server] Running on stdio");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("[3DCad MCP Server Fatal]", err);
    process.exit(1);
  });
}

module.exports = { server, activeSolids, activeFeatures, assemblyManager };
