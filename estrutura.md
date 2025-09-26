Perfeito! Abaixo está um **esqueleto de projeto completo** com **frontend em Angular**, backend em **Express + Prisma + SQLite**, para fazer o chat conversor TS → AdvPL. Você pode usar como base e adaptar conforme suas necessidades.

Vou dividir por partes:

* Estrutura de pastas
* Backend (Express + Prisma + API do ChatGPT)
* Frontend (Angular)
* Considerações e melhorias

Se quiser, posso gerar um repositório no GitHub com tudo isso já pronto para você clonar.

---

## 📂 Estrutura de Pastas Sugerida

```
/conversor-ts-advpl
  /backend
    prisma/
      schema.prisma
    src/
      routes/
        converter.ts
      services/
        openaiService.ts
      index.ts
    package.json
    tsconfig.json
    .env
  /frontend
    angular.json
    package.json
    tsconfig.json
    src/
      app/
        components/
          editor/
            editor.component.ts
            editor.component.html
          resultado/
            resultado.component.ts
            resultado.component.html
        services/
          api.service.ts
        app.component.ts
        app.module.ts
      assets/
      index.html
  README.md
```

---

## 🏗️ Backend

### Dependências principais

No backend, use:

* `express`
* `@prisma/client`
* `prisma`
* `openai`
* `dotenv`
* Tipos se for TypeScript: `@types/express`, etc.

Você já viu exemplos de uso de Express + Prisma com SQLite. ([DEV Community][1])
Prisma facilita consultas tipo-safe e migrations. ([Prisma][2])

### Exemplo de `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Conversao {
  id         Int      @id @default(autoincrement())
  codigoTs   String
  resultado  String
  createdAt  DateTime @default(now())
}
```

Esse modelo pode servir para logar conversões feitas (opcional).

### `.env`

```
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="sua_chave_aqui"
```

### Backend — `src/index.ts`

```ts
import express from "express";
import cors from "cors";
import converterRoute from "./routes/converter";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

// Rota health check ou raiz
app.get("/", (req, res) => {
  res.send("Conversor TS → AdvPL API rodando");
});

// Rota de conversão
app.use("/api", converterRoute);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Backend rodando em http://localhost:${port}`);
});
```

### `src/routes/converter.ts`

```ts
import { Router } from "express";
import { converterTsParaAdvpl } from "../services/openaiService";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.post("/converter", async (req, res) => {
  try {
    const { codigoTs } = req.body;
    if (!codigoTs) {
      return res.status(400).json({ error: "Envie código TS a ser convertido" });
    }
    const resultado = await converterTsParaAdvpl(codigoTs);

    // Opcional: salvar no banco
    await prisma.conversao.create({
      data: {
        codigoTs,
        resultado,
      },
    });

    res.json({ resultado });
  } catch (err: any) {
    console.error("Erro converter:", err);
    res.status(500).json({ error: err.message || "Erro interno" });
  }
});

export default router;
```

### `src/services/openaiService.ts`

```ts
import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY!,
});
const openai = new OpenAIApi(configuration);

export async function converterTsParaAdvpl(codigoTs: string): Promise<string> {
  const prompt = `
Você é um assistente especialista em conversão de código TypeScript para AdvPL (linguagem do ERP Protheus).

Ao receber um código TypeScript, você deve:

1. Explicar brevemente o que o código faz.
2. Converter para AdvPL com comentários explicativos.
3. Identificar e marcar ⚠️ onde algo não puder ser convertido diretamente e sugerir alternativa.
4. Usar sintaxe típica do Protheus (User Function, Local, estruturas de loop, etc).

Código TypeScript:
\`\`\`ts
${codigoTs}
\`\`\`
  `;

  const resp = await openai.createChatCompletion({
    model: "gpt-4", // ou gpt-3.5-turbo, conforme seu plano
    messages: [
      { role: "system", content: "Você é um conversor TS → AdvPL especializado" },
      { role: "user", content: prompt },
    ],
    temperature: 0.0,
    max_tokens: 1024,
  });

  const content = resp.data.choices[0].message?.content;
  return content || "";
}
```

### `tsconfig.json` (backend)

```json
{
  "compilerOptions": {
    "target": "es2019",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

### `package.json` (backend)

```json
{
  "name": "conversor-backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "openai": "^4.0.0",
    "@prisma/client": "^4.0.0"
  },
  "devDependencies": {
    "ts-node": "^10.0.0",
    "typescript": "^4.5.0",
    "prisma": "^4.0.0",
    "@types/express": "^4.17.13"
  }
}
```

Depois, execute:

```bash
cd backend
npm install
npx prisma migrate dev --name init
```

Isso criará o arquivo `dev.db` e a tabela `Conversao`.

---

## 🖥️ Frontend (Angular)

### Instalação inicial

No diretório `frontend`:

```bash
ng new frontend --routing=false --style=css
cd frontend
npm install
```

### `api.service.ts` (serviço para comunicar com backend)

```ts
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class ApiService {
  private baseUrl = "http://localhost:3000/api";

  constructor(private http: HttpClient) {}

  converter(codigoTs: string) {
    return this.http.post<{ resultado: string }>(`${this.baseUrl}/converter`, {
      codigoTs
    });
  }
}
```

### `editor.component.ts` / `editor.component.html`

#### editor.component.ts

```ts
import { Component, Output, EventEmitter } from "@angular/core";

@Component({
  selector: "app-editor",
  templateUrl: "./editor.component.html"
})
export class EditorComponent {
  codigo: string = "";

  @Output() codigoChange = new EventEmitter<string>();

  onCodigoChange() {
    this.codigoChange.emit(this.codigo);
  }
}
```

#### editor.component.html

```html
<textarea
  rows="10"
  cols="80"
  [(ngModel)]="codigo"
  (ngModelChange)="onCodigoChange()"
></textarea>
```

Você precisará importar `FormsModule` no módulo para usar `ngModel`.

### `resultado.component.ts` / `resultado.component.html`

#### resultado.component.ts

```ts
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-resultado",
  templateUrl: "./resultado.component.html"
})
export class ResultadoComponent {
  @Input() codigoAdvpl: string = "";
}
```

#### resultado.component.html

```html
<pre>{{ codigoAdvpl }}</pre>
```

### `app.component.ts` / `app.component.html`

#### app.component.ts

```ts
import { Component } from "@angular/core";
import { ApiService } from "./services/api.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent {
  codigoTs: string = "";
  resultado: string = "";

  constructor(private api: ApiService) {}

  onCodigoChange(c: string) {
    this.codigoTs = c;
  }

  async converter() {
    const resp = await this.api.converter(this.codigoTs).toPromise();
    this.resultado = resp.resultado;
  }
}
```

#### app.component.html

```html
<h1>Conversor TS → AdvPL</h1>
<app-editor (codigoChange)="onCodigoChange($event)"></app-editor>
<button (click)="converter()">Converter</button>
<app-resultado [codigoAdvpl]="resultado"></app-resultado>
```

### `app.module.ts` (inclusões necessárias)

```ts
import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";

import { AppComponent } from "./app.component";
import { EditorComponent } from "./components/editor/editor.component";
import { ResultadoComponent } from "./components/resultado/resultado.component";

@NgModule({
  declarations: [
    AppComponent,
    EditorComponent,
    ResultadoComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

---

## 🔍 Considerações & Melhorias

* **CORS**: Certifique-se de habilitar CORS no backend (`app.use(cors())`) para que o Angular possa fazer requisições cross-origin.
* **Tratamento de erros no frontend**: mostrar erros amigáveis se a API falhar.
* **Limitação de tamanho / validação do código**: evitar que o usuário envie código enorme demais.
* **Cache de conversões já feitas**: se o usuário converter o mesmo TS várias vezes, usar resultado salvo no banco (Conversao).
* **Modo explicação**: permitir parâmetro no prompt para gerar explicações detalhadas.
* **Histórico / sessão**: permitir múltiplas conversas ou edições incrementais.
* **Segurança / autenticação**: se for usar publicamente, proteja sua API.
* **Aprimoramentos no prompt**: incluir exemplos no prompt para treinar o modelo, ajustar temperatura, tokens máximos etc.

---

Se quiser, posso gerar um repositório no GitHub com todo esse código que detalhei (frontend + backend) já funcionando, para você clonar e testar direto. Deseja que eu monte isso pra você?

[1]: https://dev.to/lachiamine/getting-started-with-prisma-sqlite-and-express-620?utm_source=chatgpt.com "Getting Started with Prisma, SQLite, and Express"
[2]: https://www.prisma.io/docs/getting-started/quickstart-sqlite?utm_source=chatgpt.com "Quickstart with TypeScript & SQLite | Prisma Documentation"
