import type { Click } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { Button, Table } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";

type LoaderData = {
  track: {
    trackId: string;
    clicks: Click[];
  };
};
export const loader: LoaderFunction = async ({ params }) => {
  const track = await db.track.findUnique({
    where: { trackId: params.trackId },
    select: {
      trackId: true,
      clicks: {
        orderBy: [
          {
            createdAt: "desc",
          },
        ],
      },
    },
  });

  if (!track) {
    throw new Error(`Track ${params.trackId} does not exist`);
  }

  const data: LoaderData = { track };

  return json(data);
};

export default function TrackRoute() {
  const data = useLoaderData<LoaderData>();
  const clipboard = useClipboard({ timeout: 500 });

  const rows = data.track.clicks.map((click) => {
    return (
      <tr key={click.id}>
        <td>
          {new Date(click.createdAt).toLocaleDateString([], { hour12: true })}
        </td>
        <td>{click.userAgent}</td>
        <td>{click.ip}</td>
      </tr>
    );
  });

  return (
    <div>
      <Button
        color={clipboard.copied ? "teal" : "blue"}
        onClick={() =>
          clipboard.copy(`${window.location.origin}/${data.track.trackId}`)
        }
      >
        {clipboard.copied ? "Copied" : "Copy"}
      </Button>
      <Table>
        <thead>
          <tr>
            <td>Date</td>
            <td>User agent</td>
            <td>IP</td>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>

      <a href={`/${data.track.trackId}`}>TEST</a>
    </div>
  );
}
