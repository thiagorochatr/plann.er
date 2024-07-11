import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { prisma } from "../lib/prisma";

export async function createActivity(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/activities", {
    schema: {
      body: z.object({
        title: z.string().min(4),
        occurs_at: z.coerce.date(),
        
      }),
      params: z.object({
        tripId: z.string().uuid(),
      })
    }
  }, async (req) => {
    const { tripId } = req.params;
    const { title, occurs_at } = req.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      }
    })

    if (!trip) {
      throw new Error("Trip not found");
    }

    if (dayjs(occurs_at).isBefore(trip.starts_at)) {
      throw new Error("Activity cannot be before the trip starts");
    }

    if (dayjs(occurs_at).isAfter(trip.ends_at)) {
      throw new Error("Activity cannot be after the trip ends");
    }

    const activity = await prisma.activity.create({
      data: {
        title,
        occurs_at,
        trip_id: tripId,
      }
    });

    return {activityId: activity.id};
  })
}