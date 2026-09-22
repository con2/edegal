// One `buildx bake` builds the three images from the shared Dockerfile so their common stages
// are built and their cache exported once. The workflow sets TAG; cache lives in the registry
// because exporting every layer to the GitHub Actions cache took longer than the build itself.
variable "IMAGE" { default = "ghcr.io/con2/edegal-v4" }
variable "TAG" { default = "dev" }

group "default" {
  targets = ["runner", "migrator", "worker"]
}

target "common" {
  context    = "."
  dockerfile = "Dockerfile"
  cache-from = ["type=registry,ref=${IMAGE}:buildcache"]
  cache-to   = ["type=registry,ref=${IMAGE}:buildcache,mode=max,image-manifest=true,oci-mediatypes=true"]
}

target "runner" {
  inherits = ["common"]
  target   = "runner"
  tags     = ["${IMAGE}:${TAG}"]
}

target "migrator" {
  inherits = ["common"]
  target   = "migrator"
  tags     = ["${IMAGE}:${TAG}-migrate"]
}

target "worker" {
  inherits = ["common"]
  target   = "worker"
  tags     = ["${IMAGE}:${TAG}-worker"]
}
