"""
Face Cameras for Gaussian Splat capture
========================================

Takes the ACTIVE selected mesh object and creates one camera per face.
Each camera is placed at the face centre (optionally pushed out along the
face normal) and aimed INWARD at the object's centre — so a rig mesh like
an icosphere gives you an even dome of cameras all looking at your subject.

Each camera is then bound to its own timeline frame, so:

    Render  ->  Render Animation   (Ctrl+F12)

produces one image per camera (frame_0001.png = camera 1, etc.) — exactly
the kind of image sequence COLMAP / Gaussian-splat pipelines expect.

USAGE
-----
1. Put a mesh (e.g. an Icosphere — Add > Mesh > Ico Sphere) around your
   subject. The subject sits at the rig's centre; the rig's faces become
   the viewpoints. More faces = more cameras = denser capture.
2. Select that rig mesh (make it the active object).
3. Open this file in Blender's Scripting tab and press Run (Alt+P).
4. Set your output path + format in Output Properties, then
   Render > Render Animation.

Tweak the CONFIG block below to taste.
"""

import bpy
import bmesh
from mathutils import Vector

# ----------------------------------------------------------------------
# CONFIG
# ----------------------------------------------------------------------
NORMAL_OFFSET   = 0.0     # push camera outward along the face normal (m)
AIM_AT_CENTRE   = True    # True: look at object centre.  False: look along -normal
LENS_MM         = 35.0    # camera focal length
CLIP_START      = 0.01
CLIP_END        = 1000.0
CLEAR_PREVIOUS  = True    # delete cameras from a previous run
COLLECTION_NAME = "FaceCameras"
SET_RENDER_RANGE = True   # set scene frame range to match camera count
# ----------------------------------------------------------------------


def get_collection(name):
    """Get or create a collection to hold the cameras, linked to the scene."""
    coll = bpy.data.collections.get(name)
    if coll is None:
        coll = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(coll)
    return coll


def clear_previous(coll):
    """Remove cameras and timeline markers created by a previous run."""
    for obj in list(coll.objects):
        bpy.data.objects.remove(obj, do_unlink=True)
    scene = bpy.context.scene
    for marker in list(scene.timeline_markers):
        scene.timeline_markers.remove(marker)


def main():
    scene = bpy.context.scene
    obj = bpy.context.active_object

    if obj is None or obj.type != 'MESH':
        raise RuntimeError("Select a MESH object first (it will be used as the camera rig).")

    coll = get_collection(COLLECTION_NAME)
    if CLEAR_PREVIOUS:
        clear_previous(coll)

    # World-space centre of the rig (median of its vertices in world space).
    mw = obj.matrix_world
    verts_world = [mw @ v.co for v in obj.data.vertices]
    centre = sum(verts_world, Vector()) / len(verts_world)

    # Work on an evaluated bmesh so we read final geometry (modifiers applied).
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.faces.ensure_lookup_table()

    # 3x3 part of the world matrix for transforming normals.
    rot = mw.to_3x3()

    cameras = []
    for i, face in enumerate(bm.faces):
        face_centre = mw @ face.calc_center_median()
        normal = (rot @ face.normal).normalized()

        loc = face_centre + normal * NORMAL_OFFSET

        cam_data = bpy.data.cameras.new(f"FaceCam_{i:04d}")
        cam_data.lens = LENS_MM
        cam_data.clip_start = CLIP_START
        cam_data.clip_end = CLIP_END

        cam_obj = bpy.data.objects.new(f"FaceCam_{i:04d}", cam_data)
        cam_obj.location = loc

        # Orient the camera. Blender cameras look down their local -Z, with +Y up.
        if AIM_AT_CENTRE:
            direction = centre - loc
        else:
            direction = -normal  # look straight into the face

        if direction.length == 0.0:
            direction = -normal
        cam_obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

        coll.objects.link(cam_obj)
        cameras.append(cam_obj)

    bm.free()

    if not cameras:
        raise RuntimeError("The selected mesh has no faces.")

    # Bind one camera per frame via timeline markers, so "Render Animation"
    # walks through every camera, one frame each.
    for i, cam_obj in enumerate(cameras):
        frame = i + 1
        marker = scene.timeline_markers.new(f"F_{frame:04d}", frame=frame)
        marker.camera = cam_obj

    if SET_RENDER_RANGE:
        scene.frame_start = 1
        scene.frame_end = len(cameras)
        scene.frame_set(1)

    # Make the first camera active so the viewport/preview has something.
    scene.camera = cameras[0]

    print(f"Created {len(cameras)} cameras in collection '{COLLECTION_NAME}'.")
    print(f"Frame range set to 1..{len(cameras)}. "
          f"Set your output path/format, then Render > Render Animation.")


if __name__ == "__main__":
    main()
