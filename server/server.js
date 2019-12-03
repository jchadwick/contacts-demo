const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const ChaosMonkey = require("./ChaosMonkey");
const contacts = require("./contacts.json");

let contactId = contacts.reduce((max, { id }) => Math.max(max, id), 0) + 1;

const app = express();

app.use(cors({ origin: "*" }));

app.use(({ method, originalUrl }, res, next) => {
  next();
  console.log(`${method} ${originalUrl} => ${res.statusCode}`);
});

app.use(bodyParser.json());

app.get("/", (_, res) => res.send("Ok"));

let onlineStatus = 200;
app.all("/status", (_, res) => res.sendStatus(onlineStatus));
app.all("/status/current", (req, res) => {
  const { code } = req.query;

  if (code && !isNaN(Number(code))) {
    onlineStatus = Number(code);
  }

  res.send(String(onlineStatus));
});

app.use(ChaosMonkey);

app.get("/contacts", (req, res) => {
  const { q } = req.query;

  const query = (q || "").toLowerCase();

  if (query) {
    const filtered = contacts.filter(x =>
      [x.displayName, x.emailAddress, x.id]
        .join("|")
        .toLowerCase()
        .includes(query.toLowerCase())
    );

    res.send(filtered);
  } else {
    res.send(contacts);
  }
});

app.get("/contacts/suggest/:query", (req, res) => {
  const query = (req.params.query || "").toLowerCase();
  const filtered = contacts.filter(x => x.displayName.includes(query));

  const results = filtered.map(({ id, displayName, profileImageUrl }) => ({
    id,
    displayName,
    profileImageUrl
  }));

  res.send(results);
});

app.post("/contacts", (req, res) => {
  const {
    displayName,
    emailAddress,
    profileImageUrl,
    firstName,
    lastName
  } = req.body;

  const id = contactId++;

  const contact = {
    id,
    displayName: displayName ? displayName : `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    emailAddress,
    profileImageUrl: profileImageUrl
      ? profileImageUrl
      : `https://api.adorable.io/avatars/285/${id}${firstName}${lastName}`
  };

  contacts.push(contact);

  res.send(contact);
});

app.get(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => res.send(contact))
);

app.put(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => {
    Object.assign(contact, req.body);
    res.send(contact);
  })
);

app.patch(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => {
    Object.assign(contact, req.body);
    res.send(contact);
  })
);

app.delete(
  "/contacts/:contactId",
  existingContactAction((contact, req, res) => {
    contacts.splice(contacts.indexOf(contact), 1);
    res.status(204);
    res.end();
  })
);

function existingContactAction(cb) {
  return (req, res) => {
    const contactId = Number(req.params.contactId);
    const contact = contacts.find(x => x.id === contactId);

    if (!contact) {
      res.status(404);
      res.end();
    } else {
      cb(contact, req, res);
    }
  };
}

const port = process.env.PORT || 8080;
app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`)
);
