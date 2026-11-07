terraform {
  required_version = ">= 1.5"

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}

resource "kubernetes_namespace" "kijani_staging" {
  metadata {
    name = var.staging_namespace

    labels = {
      environment                 = "staging"
      "app.kubernetes.io/part-of" = "kijanikiosk"
    }
  }
}