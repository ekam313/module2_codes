const mqtt = require("mqtt");

const client = mqtt.connect("mqtt://localhost:1883");

const TEST_MODE = "confirmed_fire";

// Options:
// normal
// single_danger
// two_danger
// confirmed_fire

const sensors = [
    {
        id: "sensor1",
        location: "Forest Zone A"
    },
    {
        id: "sensor2",
        location: "Forest Zone B"
    },
    {
        id: "sensor3",
        location: "Forest Zone C"
    },
    {
        id: "sensor4",
        location: "Forest Zone D"
    }
];

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function normalReading(sensor) {
    return {
        sensorId: sensor.id,
        location: sensor.location,
        temperature: Number(randomBetween(20, 32).toFixed(1)),
        smoke: Math.floor(randomBetween(5, 30)),
        fire: false,
        timestamp: new Date().toISOString()
    };
}

function dangerousReading(sensor) {
    return {
        sensorId: sensor.id,
        location: sensor.location,
        temperature: Number(randomBetween(42, 50).toFixed(1)),
        smoke: Math.floor(randomBetween(75, 95)),
        fire: true,
        timestamp: new Date().toISOString()
    };
}

function getReading(sensor, index) {
    if (TEST_MODE === "normal") {
        return normalReading(sensor);
    }

    if (TEST_MODE === "single_danger") {
        if (index === 0) {
            return dangerousReading(sensor);
        }

        return normalReading(sensor);
    }

    if (TEST_MODE === "two_danger") {
        if (index === 0 || index === 1) {
            return dangerousReading(sensor);
        }

        return normalReading(sensor);
    }

    if (TEST_MODE === "confirmed_fire") {
        if (index === 0 || index === 1 || index === 2) {
            return dangerousReading(sensor);
        }

        return normalReading(sensor);
    }

    return normalReading(sensor);
}

client.on("connect", () => {
    console.log("Connected to MQTT broker");

    setInterval(() => {
        sensors.forEach((sensor, index) => {
            const reading = getReading(sensor, index);

            const topic = `forest/${sensor.id}/data`;

            client.publish(
                topic,
                JSON.stringify(reading)
            );

            console.log(
                `${sensor.id} | ${sensor.location} | ` +
                `${reading.temperature} C | ` +
                `Smoke: ${reading.smoke} | ` +
                `Fire: ${reading.fire}`
            );
        });

        console.log("-----------------------------");
    }, 3000);
});

client.on("error", (error) => {
    console.log("MQTT error:", error.message);
});