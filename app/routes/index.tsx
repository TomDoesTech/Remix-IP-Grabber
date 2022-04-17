import { Button, Container, TextInput } from "@mantine/core";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { customAlphabet } from "nanoid";
import { db } from "~/utils/db.server";

const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz1234567890", 10);

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const redirectUrl = form.get("redirectUrl");

  if (typeof redirectUrl !== "string") {
    throw new Error("Invalid redirectUrl");
  }

  const fields = { redirectUrl, trackId: nanoid() };

  const track = await db.track.create({
    data: fields,
  });

  return redirect(`/tracks/${track.trackId}`);
};

export default function Index() {
  return (
    <Container>
      <Form method="post" style={{ display: "flex", alignItems: "flex-end" }}>
        <TextInput
          size="xl"
          placeholder="https://gogole.com"
          label="Redirect URL"
          required
          name="redirectUrl"
          style={{ flex: 1 }}
          type="url"
        />

        <Button ml="md" size="xl" type="submit">
          Create tracker
        </Button>
      </Form>
    </Container>
  );
}
