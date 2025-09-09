
## Prepare Docker:

1. Install docker desktop
2. Use `docker --version` to check version.

## Install Steps:

1. `docker run --gpus=all -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama`
2. `docker exec ollama ollama pull [MODEL]` to pull any models you like from `https://ollama.com/search`!

## Notes

1. `-p 11434:11434` opens port 11434 on the container for Ollama.
2. If you want to access docker hosted applications in another docker container, you need to use `host.docker.internal:PORT`.
