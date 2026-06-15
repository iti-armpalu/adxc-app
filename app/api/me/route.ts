export async function GET() {
    const credentials = btoa(
        `${process.env.ADXC_USERNAME}:${process.env.ADXC_PASSWORD}`
    );

    const res = await fetch("https://api.adxc.ai/v1/users/me", {
        headers: {
            Authorization: `Basic ${credentials}`,
        },
    });

    const data = await res.json();
    return Response.json(data);
}