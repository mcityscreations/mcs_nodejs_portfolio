import { container } from 'tsyringe';

/** Importing services to register */
// Databases
import { RedisService } from '../../database/redis/redisService';
// Security modules
import { SecurityController } from '../../security/securityController';
import { AuthMiddlewares } from '../../security/securityMiddlewares';
import { AuthenticationFlowService } from '../../security/authenticationFlowService';
import { JWTRepository } from '../../security/jwt/jwtRepository';
import { JWTService } from '../../security/jwt/jwtService';
import { SecurityLogRepository } from '../../security/logger/loggerRepository';
import { SecurityLoggerService } from '../../security/logger/loggerService';
import { LoginService } from '../../security/login/loginService';
import { MfaSessionRepository } from '../../security/mfa/mfaRepository';
import { MfaSessionService } from '../../security/mfa/mfaService';
import { OtpService } from '../../security/otp/otpService';
import { RateLimiterRepository } from '../../security/rateLimiter/rateLimiterRepository';
import { RateLimiterService } from '../../security/rateLimiter/rateLimiterService';
import { RecaptchaService } from '../../security/recaptcha/recaptchaService';
import { WeatherController } from '../../weather/weatherController';
import { WeatherRepository } from '../../weather/weatherRepository';
import { WeatherService } from '../../weather/weatherService';
import { createWeatherProvider } from '../../weather/weatherConfig';
import { WeatherProvider, WEATHER_PROVIDER_TOKEN } from '../../weather/weatherInterfaces';


export function registerDependencies() {
    
    // Infrastructures dependencies
    container.registerSingleton(RedisService);
    
    // Repositories
    container.registerSingleton(JWTRepository);
    container.registerSingleton(SecurityLogRepository);
    container.registerSingleton(MfaSessionRepository);
    container.registerSingleton(RateLimiterRepository);
    container.registerSingleton(WeatherRepository);
    
    // Services
    container.registerSingleton(AuthMiddlewares);
    container.registerSingleton(AuthenticationFlowService);
    container.registerSingleton(JWTService);
    container.registerSingleton(SecurityLoggerService);
    container.registerSingleton(LoginService);
    container.registerSingleton(MfaSessionService);
    container.registerSingleton(OtpService);
    container.registerSingleton(RateLimiterService);
    container.registerSingleton(RecaptchaService);
    container.registerSingleton(WeatherService);

    // Providers //
    // OpenAPIWeather
    container.register<WeatherProvider>(WEATHER_PROVIDER_TOKEN, {
    useFactory: () => {
        const provider = createWeatherProvider('OPEN_WEATHER_MAP'); 
        return provider;
    },
});

    // Controllers
    container.registerSingleton(SecurityController);
    container.registerSingleton(WeatherController);
}