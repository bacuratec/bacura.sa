FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

التغيير الوحيد هو السطر الأول: `node:18-alpine` ← `node:20-alpine`

---

## ملاحظة إضافية

لاحظت في اللوج الأخير أن المتغيرات لا تزال تحتوي `localhost`:
```
NEXT_PUBLIC_MOYASAR_CALLBACK_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
NEXT_PUBLIC_SIGNUP_PROMO_IMAGE=http://localhost:3000/images/signup-promo.png
