import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from "nodemailer";
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";

export async function createInvite(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips/:tripId/invites", {
    schema: {
      body: z.object({
        email: z.string().email(),
      }),
      params: z.object({
        tripId: z.string().uuid(),
      })
    }
  }, async (req) => {
    const { tripId } = req.params;
    const { email } = req.body;

    const trip = await prisma.trip.findUnique({
      where: {
        id: tripId,
      }
    })

    if (!trip) {
      throw new Error("Trip not found");
    }

    const participant = await prisma.participant.create({
      data: {
        trip_id: tripId,
        email,
      }
    })

    const formattedStartsAt = dayjs(trip.starts_at).format('LL');
    const formattedEndsAt = dayjs(trip.ends_at).format('LL');

    const mail = await getMailClient();

    const confirmationLink = `http://localhost:3333/participants/${participant.id}/confirm`;

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'oi@plann.er'
      },
      to: participant.email,
      subject: `Confirme sua presença na viagem para ${trip.destination} em ${formattedStartsAt}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Você foi convidado(a) para participar de uma viagem para <strong>${trip.destination}</strong> nas datas de <strong>${formattedStartsAt}</strong> até <strong>${formattedEndsAt}</strong>.</p>
          <p>Para confirmar sua presença na viagem, clique no link abaixo:</p>
          <p>
            <a href="${confirmationLink}">Confirmar presença</a>
          </p>
          <p>Se você não planejou essa viagem, por favor ignore este e-mail.</p>
          <p>Atenciosamente,</p>
          <p>Equipe plann.er</p>
        </div>
      `.trim()
    });

    console.log(nodemailer.getTestMessageUrl(message));

    return { participantId: participant.id };
  })
}