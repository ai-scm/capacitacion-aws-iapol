# Íconos oficiales de AWS (Architecture Icons)

Esta carpeta contiene los íconos **oficiales** de los servicios de AWS usados en
el diagrama de arquitectura. Se sirven de forma local (sin CDN en tiempo de
ejecución) y se consumen desde `src/components/common/IconosServicio.jsx`.

## Cómo obtenerlos

1. Abre la página oficial de AWS Architecture Icons:
   https://aws.amazon.com/architecture/icons/
2. Descarga el **Asset Package** (toolkit oficial).
3. Del paquete, copia el SVG de cada servicio a ESTA carpeta
   (`public/img/aws/`) con EXACTAMENTE estos nombres de archivo:

   | Servicio              | Archivo esperado aquí        |
   |-----------------------|------------------------------|
   | Amazon S3             | `Arch_Amazon-Simple-Storage-Service_16.svg`              |
   | AWS Glue              | `Arch_AWS-Glue_64.svg`               |
   | Amazon Athena         | `Arch_Amazon-Athena_64.svg`          |
   | Amazon QuickSight     | `Arch_Amazon-QuickSight_64.svg`      |

En el toolkit, los SVG suelen venir en rutas como
`Architecture-Service-Icons_*/Arch_Analytics/.../Arch_Amazon-Athena_48.svg`.
Toma la versión que prefieras (p. ej. 48 px o 64 px) y renómbrala al nombre de
la tabla.

## Comportamiento

- Si el archivo existe, el diagrama muestra el ícono **oficial** de AWS.
- Si el archivo NO existe (o falla la carga), el diagrama cae automáticamente a
  un glifo propio estilizado, de modo que la interfaz nunca queda con una imagen
  rota.
- **IAPOL** no es un servicio de AWS: no tiene ícono oficial y siempre usa su
  glifo propio de marca (squid ink + turquesa).

## Licencia y uso

Los AWS Architecture Icons son marcas de Amazon Web Services y están sujetos a
las directrices de marca de AWS (https://aws.amazon.com/trademark-guidelines/).
Úsalos solo para representar servicios de AWS en diagramas de arquitectura, sin
modificarlos ni dar a entender patrocinio o afiliación de AWS. La descarga y el
uso de estos assets quedan bajo tu responsabilidad y la de tu organización.
