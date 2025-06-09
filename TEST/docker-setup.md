# Установка и настройка Docker для проекта

## Установка Docker Desktop для Windows

1. Скачайте Docker Desktop для Windows с официального сайта: [https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/)

2. Запустите установщик и следуйте инструкциям мастера установки.

3. После установки запустите Docker Desktop.

4. Дождитесь полной инициализации Docker (значок в трее станет неподвижным).

## Проверка установки

Откройте PowerShell или командную строку и выполните:

```powershell
docker version
```

Вы должны увидеть информацию о версии клиента и сервера Docker.

## Запуск MongoDB и MinIO для проекта

После успешной установки Docker Desktop:

1. Откройте PowerShell в директории проекта

2. Выполните команду:

```powershell
docker-compose -f docker-compose.test.yml up -d
```

Эта команда запустит контейнеры MongoDB и MinIO в фоновом режиме.

3. Проверьте, что контейнеры запущены:

```powershell
docker ps
```

## Проверка подключения к MongoDB

После запуска контейнеров выполните тест подключения:

```powershell
node TEST/mongo.test.cjs
```

Вы должны увидеть сообщение об успешном подключении к MongoDB.

## Остановка контейнеров

Когда вы закончите работу с проектом, вы можете остановить контейнеры:

```powershell
docker-compose -f docker-compose.test.yml down
```

## Возможные проблемы

### WSL не установлен

Если вы получаете ошибку о том, что WSL не установлен, выполните в PowerShell с правами администратора:

```powershell
wsl --install
```

После установки перезагрузите компьютер.

### Hyper-V не включен

Если Docker сообщает, что Hyper-V не включен, выполните в PowerShell с правами администратора:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```

После включения Hyper-V перезагрузите компьютер.

### Виртуализация в BIOS

Убедитесь, что виртуализация включена в BIOS вашего компьютера.