
## Prepare Docker:

1. Install docker desktop
2. Use `docker --version` to check version.

## Install Steps:

1. `docker volume create n8n_data`
2. `docker run -it --rm --name n8n -p 5678:5678 -p 11434:11434 -e GENERIC_TIMEZONE="Australia/Darwin" -e TZ="Australia/Darwin" -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true -e N8N_RUNNERS_ENABLED=true -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n`
3. Head to `http://localhost:5678/`

## Notes

1. `-p 5678:5678` opens port 5678 on the container for n8n webpage
2. `-p 11434:11434` opens port 11434 on the container for Ollama
3. `GENERIC_TIMEZONE="Australia/Darwin"` and `TZ="Australia/Darwin` are to set the timezone for nodes / global
4. Within a docker container applicaiton, if you want to access the host's network on opened ports, you need to use `host.docker.internal:PORT`. Requires the port to be open via the `-p` argument.
