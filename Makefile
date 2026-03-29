.PHONY: dev prod stop logs migrate shell-backend shell-db clean
dev-db:
	docker compose up -d postgres redis

dev-backend:
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

dev-worker:
	cd backend && source venv/bin/activate && celery -A app.core.celery_app worker --loglevel=info

dev-flower:
	cd backend && source venv/bin/activate && celery -A app.core.celery_app flower --port=5555

dev-frontend:
	cd frontend && npm run dev
prod:
	docker compose up -d --build

stop:
	docker compose down

restart:
	docker compose restart

# ── Logs ─────────────────────────────────────
logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-worker:
	docker compose logs -f worker

logs-frontend:
	docker compose logs -f frontend
migrate:
	cd backend && source venv/bin/activate && alembic upgrade head

migrate-docker:
	docker compose exec backend alembic upgrade head
shell-backend:
	docker compose exec backend bash

shell-db:
	docker compose exec postgres psql -U postgres -d rlfold
clean:
	docker compose down -v
	docker system prune -f
