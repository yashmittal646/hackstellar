import { Request, Response } from "express";
import { Rider, DeliveryTask, Return } from "../models";

/**
 * GET /api/riders
 * List all riders in system
 */
export async function getRiders(req: Request, res: Response): Promise<void> {
  try {
    const riders = await Rider.find().sort({ createdAt: -1 });
    res.json({ success: true, count: riders.length, data: riders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/riders/current
 * Returns the primary active rider session (defaults to Vikram Sharma or first active)
 */
export async function getCurrentRider(req: Request, res: Response): Promise<void> {
  try {
    const { riderId } = req.query;
    let rider = null;

    if (riderId) {
      rider = await Rider.findOne({ riderId: String(riderId) });
    }
    if (!rider) {
      rider =
        (await Rider.findOne({ riderId: "DEMO-RIDER-01" })) ||
        (await Rider.findOne({ status: "ON_DUTY" })) ||
        (await Rider.findOne());
    }

    if (!rider) {
      res.status(404).json({ success: false, message: "No rider found" });
      return;
    }
    res.json({ success: true, data: rider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/riders/:id
 * Get single rider by id or riderId
 */
export async function getRiderById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const rider = id.startsWith("RDR-")
      ? await Rider.findOne({ riderId: id })
      : await Rider.findById(id);

    if (!rider) {
      res.status(404).json({ success: false, message: "Rider not found" });
      return;
    }
    res.json({ success: true, data: rider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PATCH /api/riders/:id/status
 * Update on-duty / break / off-duty status
 */
export async function updateRiderStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const query = id.startsWith("RDR-") ? { riderId: id } : { _id: id };
    const rider = await Rider.findOneAndUpdate(
      query,
      { $set: { status } },
      { new: true }
    );

    if (!rider) {
      res.status(404).json({ success: false, message: "Rider not found" });
      return;
    }
    res.json({ success: true, data: rider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PATCH /api/riders/:id
 * Update rider profile info (phone, vehicle plate, battery)
 */
export async function updateRiderProfile(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { phone, vehicleNumber, batteryLevel, model } = req.body;

    const query = id.startsWith("RDR-") ? { riderId: id } : { _id: id };
    const updateObj: any = {};
    if (phone) updateObj.phone = phone;
    if (vehicleNumber) updateObj["vehicle.plateNumber"] = vehicleNumber;
    if (model) updateObj["vehicle.model"] = model;
    if (batteryLevel !== undefined) updateObj["vehicle.batteryLevel"] = batteryLevel;

    const rider = await Rider.findOneAndUpdate(query, { $set: updateObj }, { new: true });

    if (!rider) {
      res.status(404).json({ success: false, message: "Rider not found" });
      return;
    }
    res.json({ success: true, data: rider });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/riders/:id/tasks
 * Get all tasks assigned to rider
 */
export async function getRiderTasks(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const rider = id.startsWith("RDR-")
      ? await Rider.findOne({ riderId: id })
      : await Rider.findById(id);

    if (!rider) {
      res.status(404).json({ success: false, message: "Rider not found" });
      return;
    }

    const tasks = await DeliveryTask.find({ rider: rider._id }).sort({ sequence: 1, createdAt: -1 });
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * PATCH /api/tasks/:id/status
 * Update status of delivery task (e.g., ACCEPTED, ARRIVED, PICKED_UP, DELIVERED)
 */
export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, otp } = req.body;

    const task = id.startsWith("TSK-")
      ? await DeliveryTask.findOne({ taskId: id })
      : await DeliveryTask.findById(id);

    if (!task) {
      res.status(404).json({ success: false, message: "Task not found" });
      return;
    }

    // If marking as delivered, verify OTP if supplied
    if (status === "DELIVERED" && otp && task.otp && otp !== task.otp) {
      res.status(400).json({ success: false, message: "Invalid delivery OTP. Please verify with customer." });
      return;
    }

    task.status = status;
    if (status === "DELIVERED") {
      task.completedAt = new Date();

      // Update rider completed tasks
      await Rider.findByIdAndUpdate(task.rider, {
        $inc: { "shiftStats.completedToday": 1, "shiftStats.totalDeliveries": 1 },
      });

      // If tied to return item, update return status
      if (task.returnItem) {
        await Return.findByIdAndUpdate(task.returnItem, {
          $set: { status: "delivered" },
        });
      }
    }

    await task.save();
    res.json({ success: true, data: task });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

