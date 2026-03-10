version: "3.9"

services:

  rabbitmq:
    image: rabbitmq:3-management
    container_name: rabbitmq
    restart: always
    ports:
      - "5672:5672"
      - "15672:15672"
    networks:
      - microservices-net

  api-gateway:
    # build: ./services/api-gateway
    image: chamalakamarasinghe/event-mgt-api-gateway:latest
    container_name: api-gateway
    restart: always
    ports:
      - "5004:5004"
    env_file:
    - ./services/api-gateway/.env
    depends_on:
      - auth-service
      - events-service
    networks:
      - microservices-net

  auth-service:
    # build: ./services/auth-service
    image: chamalakamarasinghe/event-mgt-auth-service:latest
    container_name: auth-service
    restart: always
    env_file:
    - ./services/auth-service/.env
    ports:
      - "5005:5005"
    depends_on:
      - rabbitmq
    networks:
      - microservices-net

  events-service:
    # build: ./services/event-service
    image: chamalakamarasinghe/event-mgt-event-service:latest
    container_name: event-service
    restart: always
    env_file:
    - ./services/event-service/.env
    ports:
      - "5006:5006"
    depends_on:
      - rabbitmq
    networks:
      - microservices-net

  notification-service:
    # build: ./services/notification-service
    image: chamalakamarasinghe/event-mgt-notification-service:latest
    container_name: notification-service
    restart: always
    env_file:
    - ./services/notification-service/.env
    ports:
      - "5007:5007"
    depends_on:
      - rabbitmq
    networks:
      - microservices-net

networks:
  microservices-net:
    driver: bridge