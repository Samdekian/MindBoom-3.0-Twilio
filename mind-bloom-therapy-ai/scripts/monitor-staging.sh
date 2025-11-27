#!/bin/bash

# Real-time Monitoring Script for Staging
# Monitors logs, metrics and health
# Usage: ./scripts/monitor-staging.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[✓]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }

# Load environment
if [ -f ".env.staging" ]; then
    export $(cat .env.staging | xargs)
else
    print_warning ".env.staging not found - some features may not work"
fi

clear
echo "================================================"
echo "  Staging Environment Monitor"
echo "  Real-time Monitoring Dashboard"
echo "================================================"
echo ""

# Main menu
while true; do
    echo "Select monitoring option:"
    echo "  1) Edge Function Logs (live)"
    echo "  2) Database Activity"
    echo "  3) Twilio Usage"
    echo "  4) Error Summary"
    echo "  5) Performance Metrics"
    echo "  6) Health Check"
    echo "  7) All Functions Status"
    echo "  q) Quit"
    echo ""
    read -p "Choose option: " OPTION
    
    case $OPTION in
        1)
            print_info "Monitoring edge function logs (Ctrl+C to stop)..."
            echo "Which function?"
            echo "  1) twilio-video-token"
            echo "  2) create-breakout-room"
            echo "  3) close-breakout-room"
            echo "  4) move-participant"
            echo "  5) bulk-assign-participants"
            echo "  6) All"
            read -p "Choose: " FUNC_CHOICE
            
            case $FUNC_CHOICE in
                1) supabase functions logs twilio-video-token --follow ;;
                2) supabase functions logs create-breakout-room --follow ;;
                3) supabase functions logs close-breakout-room --follow ;;
                4) supabase functions logs move-participant --follow ;;
                5) supabase functions logs bulk-assign-participants --follow ;;
                6) supabase functions logs --follow ;;
                *) print_warning "Invalid choice" ;;
            esac
            ;;
            
        2)
            print_info "Database Activity (last 10 events)..."
            if [ -n "$DATABASE_URL" ]; then
                psql "$DATABASE_URL" -c "
                    SELECT 
                        event_type,
                        participant_name,
                        created_at
                    FROM session_analytics_events
                    WHERE event_type LIKE '%breakout%'
                    ORDER BY created_at DESC
                    LIMIT 10;
                " 2>/dev/null || print_warning "Could not fetch data"
            else
                print_warning "DATABASE_URL not set"
            fi
            echo ""
            read -p "Press enter to continue..."
            ;;
            
        3)
            print_info "Twilio Usage..."
            print_info "Visit: https://console.twilio.com/us1/monitor/usage"
            print_info "Check:"
            echo "  - Active Rooms"
            echo "  - Participant Minutes"
            echo "  - Current Costs"
            echo ""
            read -p "Press enter to continue..."
            ;;
            
        4)
            print_info "Error Summary (last 20 errors)..."
            supabase functions logs --level error --limit 20 2>/dev/null || {
                print_warning "Could not fetch error logs"
            }
            echo ""
            read -p "Press enter to continue..."
            ;;
            
        5)
            print_info "Performance Metrics..."
            if [ -n "$DATABASE_URL" ]; then
                echo ""
                echo "Active Breakout Rooms:"
                psql "$DATABASE_URL" -c "
                    SELECT COUNT(*) as active_rooms
                    FROM breakout_rooms
                    WHERE is_active = true;
                " 2>/dev/null
                
                echo ""
                echo "Active Participants:"
                psql "$DATABASE_URL" -c "
                    SELECT COUNT(*) as active_participants
                    FROM breakout_room_participants
                    WHERE is_active = true;
                " 2>/dev/null
                
                echo ""
                echo "Recent Transitions (last hour):"
                psql "$DATABASE_URL" -c "
                    SELECT COUNT(*) as recent_transitions
                    FROM breakout_room_transitions
                    WHERE moved_at > NOW() - INTERVAL '1 hour';
                " 2>/dev/null
            else
                print_warning "DATABASE_URL not set"
            fi
            echo ""
            read -p "Press enter to continue..."
            ;;
            
        6)
            print_info "Running health check..."
            ./scripts/validate-staging.sh 2>/dev/null || {
                print_warning "Validation script failed"
            }
            echo ""
            read -p "Press enter to continue..."
            ;;
            
        7)
            print_info "Checking all functions status..."
            FUNCTIONS=("twilio-video-token" "create-breakout-room" "close-breakout-room" "move-participant" "bulk-assign-participants")
            
            for func in "${FUNCTIONS[@]}"; do
                STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL/functions/v1/$func" -X POST 2>/dev/null || echo "000")
                
                if [ "$STATUS" == "200" ] || [ "$STATUS" == "401" ] || [ "$STATUS" == "400" ]; then
                    print_success "$func: ONLINE (HTTP $STATUS)"
                else
                    print_warning "$func: OFFLINE (HTTP $STATUS)"
                fi
            done
            echo ""
            read -p "Press enter to continue..."
            ;;
            
        q|Q)
            print_info "Exiting monitor..."
            exit 0
            ;;
            
        *)
            print_warning "Invalid option"
            ;;
    esac
    
    clear
    echo "================================================"
    echo "  Staging Environment Monitor"
    echo "================================================"
    echo ""
done

