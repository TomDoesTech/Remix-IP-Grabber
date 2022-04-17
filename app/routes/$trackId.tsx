import { Loader } from "@mantine/core";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { db } from "~/utils/db.server";

export const action: ActionFunction = async ({ request, params }) => {
  const track = await db.track.findUnique({
    where: { trackId: params.trackId },
    select: {
      redirectUrl: true,
      id: true,
    },
  });

  if (!track) {
    throw new Error(`Track ${params.trackId} does not exist`);
  }

  const form = await request.formData();
  const ip = form.get("ip");

  if (typeof ip !== "string") {
    throw new Error("Missing user data");
  }

  const userAgent = request.headers.get("user-agent");

  if (typeof userAgent !== "string") {
    throw new Error("Missing user data");
  }

  const fields = { userAgent, ip, trackId: track.id };

  await db.click.create({ data: fields });

  return redirect(track.redirectUrl);
};

export default function TrackRoute() {
  const [ip, setIp] = useState();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((res) => {
        setIp(res.ip);
      });
  }, []);

  useEffect(() => {
    if (ip) {
      formRef.current?.submit();
    }
  }, [ip]);

  return (
    <>
      <Loader />
      <Form ref={formRef} method="post" hidden>
        ip: {ip}
        <input name="ip" defaultValue={ip} />
      </Form>
    </>
  );
}
