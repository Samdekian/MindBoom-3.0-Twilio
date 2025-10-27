#!/bin/bash

# MindBoom 3.0 - Twilio: Production Health Check Script
# This script performs comprehensive health checks on the production deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_URL="${APP_URL:-https://yourdomain.com}"
SUPABASE_URL="${SUPABASE_URL:-}"
SUPABASE_ANON_KEY="${SUPABASE_ANON_KEY:-}"
TIMEOUT=10

echo "======================================"
echo "MindBoom 3.0 Health Check"
echo "======================================"
echo "Target: $APP_URL"
echo "Time: $(date)"
echo "======================================"
echo ""

# Function to print success
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print warning
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local expected_status=${2:-200}
    local description=$3
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        success "$description (HTTP $response)"
        return 0
    else
        error "$description (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Function to check response time
check_response_time() {
    local url=$1
    local max_time=${2:-2}
    local description=$3
    
    response_time=$(curl -o /dev/null -s -w '%{time_total}\n' --max-time $TIMEOUT "$url" 2>/dev/null || echo "999")
    
    if (( $(echo "$response_time < $max_time" | bc -l) )); then
        success "$description (${response_time}s)"
        return 0
    else
        warning "$description (${response_time}s, expected < ${max_time}s)"
        return 1
    fi
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    
    if [[ $domain == https://* ]]; then
        domain=${domain#https://}
        domain=${domain%%/*}
        
        expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
        
        if [ -n "$expiry_date" ]; then
            expiry_epoch=$(date -j -f "%b %d %T %Y %Z" "$expiry_date" "+%s" 2>/dev/null || date -d "$expiry_date" "+%s" 2>/dev/null)
            current_epoch=$(date "+%s")
            days_until_expiry=$(( ($expiry_epoch - $current_epoch) / 86400 ))
            
            if [ $days_until_expiry -gt 30 ]; then
                success "SSL Certificate valid ($days_until_expiry days remaining)"
                return 0
            elif [ $days_until_expiry -gt 0 ]; then
                warning "SSL Certificate expires soon ($days_until_expiry days remaining)"
                return 1
            else
                error "SSL Certificate expired"
                return 1
            fi
        else
            error "Could not check SSL certificate"
            return 1
        fi
    else
        warning "Not using HTTPS, skipping SSL check"
        return 1
    fi
}

# Function to check DNS
check_dns() {
    local domain=$1
    domain=${domain#https://}
    domain=${domain#http://}
    domain=${domain%%/*}
    
    ip=$(dig +short "$domain" 2>/dev/null | head -n 1)
    
    if [ -n "$ip" ]; then
        success "DNS Resolution ($domain -> $ip)"
        return 0
    else
        error "DNS Resolution failed for $domain"
        return 1
    fi
}

# Track overall status
overall_status=0

echo "1. Connectivity Checks"
echo "----------------------"

# Main health check
if check_http "$APP_URL/health.json" 200 "Main Health Endpoint"; then
    :
else
    overall_status=1
fi

# Check main app
if check_http "$APP_URL" 200 "Main Application"; then
    :
else
    overall_status=1
fi

echo ""
echo "2. Performance Checks"
echo "---------------------"

# Response time check
if check_response_time "$APP_URL" 2 "Response Time"; then
    :
else
    overall_status=1
fi

echo ""
echo "3. Security Checks"
echo "------------------"

# DNS check
if check_dns "$APP_URL"; then
    :
else
    overall_status=1
fi

# SSL check
if check_ssl "$APP_URL"; then
    :
else
    overall_status=1
fi

# Check security headers
echo -n "Checking security headers... "
headers=$(curl -s -I "$APP_URL" 2>/dev/null || echo "")

if echo "$headers" | grep -q "X-Frame-Options"; then
    success "Security headers present"
else
    warning "Some security headers missing"
    overall_status=1
fi

echo ""
echo "4. API Checks"
echo "-------------"

# Supabase health check (if credentials provided)
if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_ANON_KEY" ]; then
    if check_http "$SUPABASE_URL/rest/v1/" 200 "Supabase API"; then
        :
    else
        overall_status=1
    fi
else
    warning "Supabase credentials not provided, skipping API check"
fi

echo ""
echo "5. Docker Health (if running in container)"
echo "-------------------------------------------"

# Check if running in Docker
if [ -f /.dockerenv ]; then
    success "Running in Docker container"
    
    # Check container health
    if command -v docker &> /dev/null; then
        container_health=$(docker inspect --format='{{.State.Health.Status}}' mindboom-production 2>/dev/null || echo "unknown")
        
        if [ "$container_health" = "healthy" ]; then
            success "Container health status: healthy"
        else
            warning "Container health status: $container_health"
            overall_status=1
        fi
    fi
else
    warning "Not running in Docker container"
fi

echo ""
echo "======================================"
echo "Health Check Summary"
echo "======================================"

if [ $overall_status -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    exit 0
else
    echo -e "${RED}Some checks failed or warnings were issued${NC}"
    exit 1
fi

