
## Prepare Docker:

1. Install docker desktop
2. Use `docker --version` to check version.

## Install Steps:

1. `docker volume create n8n_data`
2. `docker run --name n8n -p 5678:5678 -e GENERIC_TIMEZONE="Australia/Darwin" -e TZ="Australia/Darwin" -e N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true -e N8N_RUNNERS_ENABLED=true -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n`
3. Head to `http://localhost:5678/`

## Notes

1. `-p 5678:5678` opens port 5678 on the container for n8n webpage
2. `GENERIC_TIMEZONE="Australia/Darwin"` and `TZ="Australia/Darwin` are to set the timezone for nodes / global
3. Within a docker container application, if you want to access the host's network on opened ports, you need to use `host.docker.internal:PORT`. Requires the port to be open via the `-p` argument.
4. Add the `-it --rm ` flag after `docker run` to make the terminal interactive and when the terminal closes, the container is removed as well. Data is saved as it reads from the drive.
5. There is a API available to local-hosted n8n instances at the url `http://localhost:5678/api/v1/docs/#/`
