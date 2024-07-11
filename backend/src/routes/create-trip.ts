import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import nodemailer from 'nodemailer';
import { z } from "zod";
import { dayjs } from "../lib/dayjs";
import { getMailClient } from "../lib/mail";
import { prisma } from "../lib/prisma";
import { ClientError } from "../errors/client-error";
import { env } from "../env";

export async function createTrip(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/trips", {
    schema: {
      body: z.object({
        destination: z.string().min(4),
        starts_at: z.coerce.date(),
        ends_at: z.coerce.date(),
        owner_name: z.string(),
        owner_email: z.string().email(),
        emails_to_invite: z.array(z.string().email()),
      })
    }
  }, async (req) => {
    const { destination, starts_at, ends_at, owner_email, owner_name, emails_to_invite } = req.body;

    if (dayjs(starts_at).isBefore(new Date())) {
      throw new ClientError("Invalid trip start date.");
    }

    if (dayjs(ends_at).isBefore(dayjs(starts_at))) {
      throw new ClientError("Invalid trip end date.");
    }

    const trip = await prisma.trip.create({
      data: {
        destination,
        starts_at,
        ends_at,
        participants: {
          createMany: {
            data: [
              {
                name: owner_name,
                email: owner_email,
                is_owner: true,
                is_confirmed: true,
              },
              ...emails_to_invite.map(email => ({
                email,
              }))
            ]
          }
        }
      }
    })

    const formattedStartsAt = dayjs(starts_at).format('LL');
    const formattedEndsAt = dayjs(ends_at).format('LL');

    const confirmationLink = `${env.API_BASE_URL}/trips/${trip.id}/confirm`;

    const mail = await getMailClient();

    const message = await mail.sendMail({
      from: {
        name: 'Equipe plann.er',
        address: 'oi@plann.er'
      },
      to: {
        name: owner_name,
        address:  owner_email
      },
      subject: `Confirme sua viagem para ${destination} em ${formattedStartsAt}`,
      html: `
        <div style="font-family: sans-serif; font-size: 16px; line-height: 1.6;">
          <p>Olá ${owner_name},</p>
          <p>Estamos muito felizes em ver que você está planejando uma viagem para <strong>${destination}</strong> nas datas de <strong>${formattedStartsAt}</strong> até <strong>${formattedEndsAt}</strong>.</p>
          <p>Para confirmar sua participação, clique no link abaixo:</p>
          <p>
            <a href="${confirmationLink}">Confirmar viagem</a>
          </p>
          <p>Se você não planejou essa viagem, por favor ignore este e-mail.</p>
          <p>Atenciosamente,</p>
          <p>Equipe plann.er</p>
        </div>
      `.trim()
    });

    console.log(nodemailer.getTestMessageUrl(message));
    
    return {tripId: trip.id};
  })
}