git clone

# for frontend 
npm install


run xampp
create database Auralendr 
paste .env file
change db name
cd backend

# Run as administrator...
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://php.new/install/windows/8.4'))

restart

cd backend

composer install

php artisan migrate:fresh

php artisan key:generate

php artisan db:seed --class=AdminSeeder

# Run the server
php artisan serve     

# Run the frontend
npm run dev
